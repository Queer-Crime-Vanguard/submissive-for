import xml.etree.ElementTree as ET

def parse_fix(svg_fn):
    tree = ET.parse(svg_fn)
    root = tree.getroot()
    x_0, y_0, x_1, y_1 = map(float, root.attrib['viewBox'].split())
    root.attrib['width'] = str(x_1 - x_0)
    root.attrib['height'] = str(y_1 - y_0)

    return ET.tostring(root)

def main(svg_fn):
    try:
        res_svg = parse_fix(svg_fn)
    except Exception as e:
        print(f'Error `{e}` while parsing', svg_fn)
        return 0

    backup = open(svg_fn, 'rb').read()

    with open(svg_fn, 'wb') as svg_f:
        try:
            svg_f.write(res_svg)
        except Exception as e:
            print(f'Error `{e}` while writing', svg_fn)
            svg_f.write(backup)
            return 0
        else:
            print('Succesfully fixed', svg_fn)
            return 1
        finally:
            svg_f.close()
            

if __name__ == '__main__':
    import sys
    for fn in sys.argv[1:]:
        main(fn)