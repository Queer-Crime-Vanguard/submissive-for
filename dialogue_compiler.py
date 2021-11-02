from typing import Dict, Sequence


def line_extract(line:str) -> Dict[str, str]:
    speaker, message = line.split(":", maxsplit=1)
    
    # extract highlight text
    hl_text = None

    hl_start = message.find("[") + 1
    if hl_start:
        hl_end = message.find("]")
        hl_text = message[hl_start:hl_end]

    is_bookmark = (message.find("@[") >= 0)

    # higlight clean
    if hl_start:
        hl_clean_message = message[:hl_start-1] + message[hl_start:hl_end] + message[hl_end+1:]
    else:
        hl_clean_message = message
    
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


def line_build(meta: Dict[str, str], speaker, highlight, is_bookmark, emotion, actions, actions_params, text):
    
    # get detailied information about speaker using meta
    speaker_meta = meta['speakers'].get(speaker)
    if speaker_meta:
        letter = speaker_meta['letter']
        position = speaker_meta['position']
        bubble_color = speaker_meta.get('bubble_color')
    elif speaker.rstrip():
        raise NameError(f"There is no such `{speaker}` speaker in meta")
    else:
        letter = None
        position = None
        bubble_color = None

    # highlight
    html_hightlight = f'<div class="highlight {"bookmark" if is_bookmark else "option"}"><p>{highlight}</p></div>' if highlight else ''

    # bubble
    html_bubble = f'<div class="bubble"><p>{text}</p></div>' if text else ''

    # linemeta--
    metadata = {'speaker': letter, 'emotion': emotion}
    metadata.update(actions_params)
    if 'init' in actions and bubble_color: metadata['bubble_color'] = bubble_color
    actual_metadata = {k:v for k, v in metadata.items() if v}
    md_string = " ".join([f'{k}="{v}"' for k, v in actual_metadata.items()])

    html_linemeta = f'<linemeta {md_string}></linemeta>'
 

    return f'<div class="line {position} {" ".join(actions)}">{html_hightlight} {html_bubble} {html_linemeta}</div>'
    

def template_compile(template: str, lines: Sequence[str]):
    target = template.find('$CONTENT$')
    cl = template[:target].rfind('\n') + 1
    nl = template.find('\n', target) + 1
    insert_line = template[cl:nl]
    return template[:cl] + \
           ''.join(map(lambda c: insert_line.replace('$CONTENT$', c), lines)) + \
           template[nl:]


OPEN_BRANACHING = '<branching>'
CLOSE_BRANCHING = '</branching>'

OPEN_BRANCH = '<branch>'
CLOSE_BRANCH = '</branch>'

def build(meta: Dict[str, str], template: str, raw_lines: Sequence[str]):
    built_lines = list()

    for i, raw_line in enumerate(raw_lines):
        line = raw_line.strip()
        if line.startswith('//'): # comment
            continue
        elif line.startswith('{-'): # open branching
            built_line = OPEN_BRANACHING + OPEN_BRANCH
        elif line.startswith('-}'): # closing branching
            built_line = CLOSE_BRANCH + CLOSE_BRANCHING
        elif line.startswith('-'): # next branch
            built_line = CLOSE_BRANCH + OPEN_BRANCH
        else:  # try to parse line
            try:
                linedata = line_extract(line)
            except Exception as e:
                e.parsing = True
                e.line_number = i+1
                raise e
            
            try:
                built_line = line_build(meta, **linedata)
            except Exception as e:
                e.parsing = False
                e.line_number = i+1
                raise e

        built_lines.append(built_line)
    
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

    ### Basic

    * Each line should go in a format `Speaker: Text`, for example `Alice: Hello!`
    * You could use hashtags to point emotions `Bob: Hello, Alice! #surprised`
    * You could use highlight markup for suggesting phrases `Alice: [How are you] doing?`
    * You could use bookmarks markup `Bob: @[mood]`
    * You could write comments `// some comment`

    ### Action hashtags

    For special interactions you could use action-hastags with #! syntax like this: `Alice: #!typing`
    You could also provide a parameter for action seperating it by colon like this: `Alice: #!pause:2`

    ### Branching

    You could provide multiple dialogue branches using `{-` `-` `-}` syntax. Example:
    {-
    Alice: [exciting] day!
    Bob: yeah
    - 
    Alice: [anxious] day...
    Bob: eh, do you want some water?
    -}

    '''

    import json

    with open(config) as meta_f:
        meta = json.load(meta_f)

    with open(template) as template_f:
        template_content = template_f.read()

    import os
    import os.path

    def process(fn, ofn):
        with open(fn) as i_f:
            try:
                result = build(meta, template_content, i_f.readlines())
            except Exception as e:
                if hasattr(e, 'line_number'):
                    action = 'parsing' if e.parsing else 'building'
                    print(f'An error occured while {action} `{fn}` line {e.line_number}: {e}')
                else:
                    print(f'An error occured during the building `{fn}`: {e}')
                return
            else:
                print(f'`{ofn}` succesfully built')
        
        with open(ofn, 'w') as o_f:
            o_f.write(result)

    if os.path.isdir(input):
        target = list(filter(lambda fn: fn.endswith('.txt'), os.listdir(input)))
        print(f'Processing `{input}`. Found {len(target)} txt files')
        for fn in target:
            process(os.path.join(input, fn), os.path.join(output, fn.rsplit('.', 1)[0] + ".html"))
    else:
        process(input, output)



if __name__ == '__main__':
    from fire import Fire

    Fire(main)