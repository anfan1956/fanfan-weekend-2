import json
import shutil
import os
from app.data import sql_list


def copy_missing_photos(arg):
    sql = f"select web.parentStyles_photos()"
    model = json.loads( sql_list(sql)[0])
    if arg:
        parent = r'T:\fanfan-weekend-2\app\static\images\parent'
    else:
        parent = r'F:\Development\fanfan-weekend-2\app\static\images\parent'
    arch = r'S:\archive_jpegs'
    src = r'S:\source_jpegs'
    styles = os.listdir(parent)
    for m in model:
        if str(m.get('parent_styleid')) not in styles:
            source = os.path.join(arch, m.get('photo'))
            target = os.path.join(src, m.get('photo'))
            print(source, target)
            shutil.copyfile(source, target)


if __name__ == '__main__':
    copy_missing_photos(False)
