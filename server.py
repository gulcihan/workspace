from flask import Flask, request, make_response 
from functools import update_wrapper
import requests
import json
import os.path
app = Flask(__name__,static_url_path='',static_folder='')

def nocache(f):
    def new_func(*args, **kwargs):
        resp = make_response(f(*args, **kwargs))
        resp.cache_control.no_cache = True
        return resp
    return update_wrapper(new_func, f)


@app.route('/')
def root():
    return app.send_static_file('deneme.html')

@app.route('/images/players/<filename>')
@nocache
def playerimg(filename):
   if os.path.isfile("images/players/"+filename):
       return app.send_static_file("images/players/"+filename)
   else:
       return app.send_static_file("images/players/default.png")


@app.route('/api/<command>', methods=['GET','POST'])
def api(command):
    # used to be data = request.data
    # but somehow that stopped working
    if len(request.form.keys())==0:
        data = ""
    else:
        data = request.form.keys()[0]
    r = requests.post('http://sentios.cloudapp.net/api/'+command, data=data)
    return (r.content, r.status_code)

if __name__ == '__main__':
    app.debug = True
    app.run(port=8000)
