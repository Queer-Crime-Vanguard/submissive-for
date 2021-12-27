import os.path

from typing import Dict, Sequence


def main(template: str, total: int, output: str):

    '''

    Alice is a trans girl 
    Bob is non-binary trans boy
    and Eva uses she/they 
    and they're all in polycule

    '''

    with open(template) as tf:
        template_string = tf.read()
    
    for i in range(1, total+1):
        out_string = template_string.replace("$GIRLDICK$", str(i))
        out_name = os.path.join(output, f"{i}.html")
        with open(out_name, "w") as outf:
            outf.write(out_string)
        print(out_name, "done!")




if __name__ == '__main__':
    from fire import Fire

    Fire(main)