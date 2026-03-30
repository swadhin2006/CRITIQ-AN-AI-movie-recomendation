import streamlit as st
import pandas as pd
import pickle
import requests
import os

# Download similarity.pkl from Google Drive if not present
def download_similarity():
    if not os.path.exists('similarity.pkl'):
        with st.spinner('Downloading model data...'):
            import subprocess
            subprocess.run(['pip', 'install', 'gdown', '-q'])
            import gdown
            file_id = '1Z_4c_WokgHdlcM6mx6e3EQTGZ_7Vm95S'
            gdown.download(f'https://drive.google.com/uc?id={file_id}', 'similarity.pkl', quiet=False, fuzzy=True)

download_similarity()


def load_static():
    with open("static/style.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    with open("static/script.js") as f:
        st.markdown(f"<script>{f.read()}</script>", unsafe_allow_html=True)

load_static()

movies_dict = pickle.load(open('movie_dict.pkl', 'rb'))
movies = pd.DataFrame(movies_dict)
similarity = pickle.load(open('similarity.pkl', 'rb'))

def fetch_poster(movie_id):
    url = f'https://api.themoviedb.org/3/movie/{movie_id}?api_key=8265bd1679663a7ea12ac168da84d2e8&language=en-US'
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        return "https://image.tmdb.org/t/p/w500/" + data['poster_path']
    except Exception as e:
        return "https://via.placeholder.com/500x750?text=No+Poster+Found"

def recommend(movie):
    movie_index = movies[movies['title'] == movie].index[0]
    distances = similarity[movie_index]
    movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]

    recommended_movies = []
    recommended_movies_posters = []
    for i in movies_list:
        movie_id = movies.iloc[i[0]].movie_id
        recommended_movies.append(movies.iloc[i[0]].title)
        recommended_movies_posters.append(fetch_poster(movie_id))

    return recommended_movies, recommended_movies_posters

st.markdown('''
<div class="hero">
    <div class="hero-title">CRITIQ</div>
    <div class="hero-sub">Your Personal Movie Guide</div>
    <div class="hero-tagline">Discover films tailored to your taste using AI-powered recommendations</div>
    <hr class="hero-divider">
</div>
''', unsafe_allow_html=True)

selected_movie_name = st.selectbox(
    "Which movie would you like to watch?",
    movies['title'].values
)

if st.button("Recommend"):
    names, posters = recommend(selected_movie_name)
    st.markdown('<div class="rec-header">Top Picks For You</div>', unsafe_allow_html=True)
    col1, col2, col3, col4, col5 = st.columns(5)

    with col1:
        st.image(posters[0])
        st.caption(names[0])

    with col2:
        st.image(posters[1])
        st.caption(names[1])

    with col3:
        st.image(posters[2])
        st.caption(names[2])

    with col4:
        st.image(posters[3])
        st.caption(names[3])

    with col5:
        st.image(posters[4])
        st.caption(names[4])