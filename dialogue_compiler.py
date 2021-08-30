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
    emotion = None

    for tag in tags:
        if tag.startswith("#!"):
            actions.append(tag.lstrip("#!"))
        else:
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
        'text': tag_clean_message
    }


def line_build(meta, speaker, highlight, is_bookmark, emotion, actions, text):
    
    # get detailied information about speaker using meta
    speaker_meta = meta['speakers'][speaker]
    letter = speaker_meta['letter']
    position = speaker_meta['position']

    # highlight
    html_hightlight = f'<div class="highlight {"bookmark" if is_bookmark else ""}"><p>{highlight}</p></div>' if highlight else ''

    # bubble
    html_bubble = f'<div class="bubble"><p>{text}</p></div>' if text else ''

    # linemeta
    html_linemeta = f'<linemeta speaker="{letter}" emotion="{emotion}"></linemeta>'

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
    lines_to_parse = filter(lambda line: not line.startswith("//"), raw_lines)
    built_lines = map(lambda line: line_build(meta, **line_extract(line)), lines_to_parse)
    return template_compile(template, built_lines)


def main(meta_json, template_fn, input_fn, output_fn):
    import json

    with open(meta_json) as meta_f:
        meta = json.load(meta_f)

    with open(template_fn) as template_f:
        template = template_f.read()

    with open(input_fn) as input_f:
        result = build(meta, template, input_f.readlines())

    with open(output_fn, 'w') as output_f:
        output_f.write(result)


if __name__ == '__main__':
    import sys
    main(*sys.argv[1:5])