def line_extract(line):
    speaker, message = line.split(":", maxsplit=1)
    
    # extract highlight text
    hl_text = None

    hl_start = message.find("[") + 1    
    if hl_start:
        hl_end = message.find("]")
        hl_text = message[hl_start:hl_end]

    # higlight clean
    hl_clean_message = message[:hl_start-1] + message[hl_end+1:] if hl_start else message
    
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
        'emotion': emotion,
        'actions': actions,
        'text': tag_clean_message
    }


def line_build(meta, speaker, highlight, emotion, actions, text):
    
    # get detailied information about speaker using meta
    speaker_meta = meta['speakers'][speaker]
    letter = speaker_meta['letter']
    position = speaker_meta['position']

    # highlight
    html_hightlight = f'<div class="highlight"><p>{highlight}</p></div>' if highlight else ''

    # bubble
    html_bubble = f'<div class="bubble"><p>{text}</p></div>' if text else ''

    # linemeta
    html_linemeta = f'<linemeta speaker="{letter}" emotion="{emotion}"></linemeta>'

    return f'<div class="line {position} {" ".join(actions)}">{html_hightlight} {html_bubble} {html_linemeta}</div>'
    

def compile(lines, build_meta):
    return "\n".join(
        map(
            lambda line: line_build(build_meta, **line_extract(line)), 
        filter(
            lambda line: not line.startswith("//"), # for comments
        lines)))


def main(meta_json, input_fn, output_fn):

    import json
    with open(meta_json) as metaf:
        meta = json.load(metaf)

    with open(input_fn) as input_f:
        result = compile(input_f.readlines(), meta)

    with open(output_fn, 'w') as output_f:
        output_f.write(result)


if __name__ == '__main__':
    import sys
    main(*sys.argv[1:4])