# Research Pulse

<img height = "100"
src="ResearchPulse.svg"
alt="ResearchPulse logo"
/>

A platform where researchers can stay up to date with the latest research and research discussions through personalized research feeds. 

## Features
Following feed - see papers published by individuals, institutions, or journals you are following 
Starred Papers - star or save papers of any kind
Discovery feed - see papers algorithmically recommended based on saved papers, followers, etc. 
Groups - be able to create a group with other researchers when you can share and discuss papers in the app
Comments - Researchers can comment in a comment section attached to each paper

## Setup Instructions

### Creating a Virtual Environment

1. Make sure you have Python installed on your system
2. Open a terminal/command prompt
3. Navigate to the project directory
4. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
5. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

### Installing Requirements

Once the virtual environment is activated, install the required packages:

```bash
pip install -r requirements.txt
```
Enter frontend folder and run npm install:

```bash
npm install
```

Start the server:

```bash
npm start
```

Open new terminal and enter the backend folder to start backend server:

```bash
python app.py
```


