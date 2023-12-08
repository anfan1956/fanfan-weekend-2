import pytidylib

tidy = pytidylib.Tidy()

with open('home.html', 'r') as f:
    html = f.read()

output = tidy.clean(html)
print(output)
