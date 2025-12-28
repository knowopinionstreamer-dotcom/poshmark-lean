from flask import Flask, request, redirect, render_template
import os
from main import run_workflow 

app = Flask(__name__)

# Create the folder for uploaded images
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    # Looks for index.html in the templates folder
    return render_template('index.html', result=None)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files: return redirect('/')
    file = request.files['file']
    if file.filename == '': return redirect('/')
    
    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        # Run the AI workflow
        result = run_workflow(filepath)
        
        # Show the result on the screen
        return render_template('index.html', result=result, image_path=filepath)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)