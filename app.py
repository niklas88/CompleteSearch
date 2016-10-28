from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
debug = True


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_categories/', methods=['GET'])
def get_categories():
    categories = [
        {
            'title': 'Author',
            'content': 'content'
        },
        {
            'title': 'Title',
            'content': 'content'
        },
        {
            'title': 'Year',
            'content': 'content'
        }
    ]

    return jsonify(categories)

if __name__ == '__main__':
    app.debug = debug
    app.run()
