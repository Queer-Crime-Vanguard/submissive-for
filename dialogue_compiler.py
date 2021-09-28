def line_extract(line):
    speaker, message = line.split(":", maxsplit=1)
    
    # extract highlight text
    hl_text = None

    hl_start = message.find("[") + 1    
    if hl_start:
        hl_end = message.find("]")
        hl_text = message[hl_start:hl_end]

    is_bookmark = (message.find("@[") >= 0)

    if hl_start:
        left_strip = hl_start - 1 - is_bookmark
        right_strip = hl_end+1

    # higlight clean
    hl_clean_message = message[:left_strip] + message[right_strip:] if hl_start else message
    
    # extract tags
    tags = filter(lambda s: s.startswith("#"), hl_clean_message.split())
    
    actions = list()
    actions_params = dict()
    emotion = None

    for tag in tags:
        if tag.startswith("#!"):
            # split action and param
            s = tag.lstrip("#!").split(':', maxsplit=1)
            # extract action
            action = s.pop(0)
            # add action if needed
            if not action in actions:
                actions.append(action)
            # update params
            if s: actions_params[action] = s[0]
        else:
            # parse emotion
            emotion = tag.lstrip("#")

    # tag clean
    tag_clean_message = " ".join(filter(lambda w: w and not w.startswith("#"), hl_clean_message.split()))

    # combine line

    return {
        'speaker': speaker,
        'highlight': hl_text,
        'is_bookmark': is_bookmark,
        'emotion': emotion,
        'actions': actions,
        'actions_params': actions_params,
        'text': tag_clean_message
    }


def line_build(meta, speaker, highlight, is_bookmark, emotion, actions, actions_params, text):
    
    # get detailied information about speaker using meta
    speaker_meta = meta['speakers'].get(speaker)
    if speaker_meta:
        letter = speaker_meta['letter']
        position = speaker_meta['position']
    elif speaker.rstrip():
        raise NameError(f"There is no such `{speaker}` speaker in meta")
    else:
        letter = None
        position = None

    # highlight
    html_hightlight = f'<div class="highlight {"bookmark" if is_bookmark else ""}"><p>{highlight}</p></div>' if highlight else ''

    # bubble
    html_bubble = f'<div class="bubble"><p>{text}</p></div>' if text else ''

    # linemeta--
    metadata = {'speaker': letter, 'emotion': emotion}
    metadata.update(actions_params)
    actual_metadata = {k:v for k, v in metadata.items() if v}
    md_string = " ".join([f'{k}="{v}"' for k, v in actual_metadata.items()])

    html_linemeta = f'<linemeta {md_string}></linemeta>'
 

    return f'<div class="line {position} {" ".join(actions)}">{html_hightlight} {html_bubble} {html_linemeta}</div>'
    

def template_compile(template, lines):
    target = template.find('$CONTENT$')
    cl = template[:target].rfind('\n') + 1
    nl = template.find('\n', target) + 1
    insert_line = template[cl:nl]
    return template[:cl] + \
           ''.join(map(lambda c: insert_line.replace('$CONTENT$', c), lines)) + \
           template[nl:]
    

def build(meta, template, raw_lines):
    lines_to_parse = filter(lambda line: not line.lstrip().startswith("//"), raw_lines)
    built_lines = map(lambda line: line_build(meta, **line_extract(line)), lines_to_parse)
    return template_compile(template, built_lines)


def main(config: str, template: str, input: str, output: str):
    '''
    Parse handsoff markup file and compile it to html dialogue

    :param str config: json configuration of dialogues
    :param str template: html template of output
    :param str i: input plain-text file with markup
    :param str o: name for output file (.html extenstion is recommend)

    ***********
    MARKUP INFO
    ***********

    * Each line should go in a format `Speaker: Text`, for example `Alice: Hello!`
    * You could use hashtags to point emotions `Bob: Hello, Alice! #surprised`
    * You could use action-hashtags for special actvities `Alice: #!typing`
    * You could use highlight markup for suggesting phrases `Alice: [how r u] How are you doing?`
    * You could use bookmarks markup `Bob: @[mood]`
    * You could write comments `// some comment`

    '''

    import json

    with open(config) as meta_f:
        meta = json.load(meta_f)

    with open(template) as template_f:
        template_content = template_f.read()

    with open(input) as i_f:
        try:
            result = build(meta, template_content, i_f.readlines())
        except Exception as e:
            print(f'An error occured during the build process: {e}')
            return

    with open(output, 'w') as o_f:
        o_f.write(result)


if __name__ == '__main__':
    from fire import Fire

    Fire(main)