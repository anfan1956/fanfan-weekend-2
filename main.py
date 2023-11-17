from app import app
from app.site_settings import debug
from waitress import serve

if __name__ == '__main__':
    app.run(port=8000, debug=debug(), host='0.0.0.0')
    serve(app, url_scheme='http')

