const app = new Vue({

    el: "#app",
    data: {

        tmdbAPIKey: "ad3dc44159bbda29e23cab3d107aa841",
        userSearch: "",

        moviesList: [],
        seriesTv: [],

        searchingEnd: false,

    },
    methods: {
        onSearchClick() {

            if (!this.userSearch) {
                return;
            }

            this.getMoviesTv("movie");
            this.getMoviesTv("tv");

            if (this.moviesList.length == 0 && this.seriesTv.length == 0) {
                this.searchingEnd = true;
            }
        },
        getFlagIcon(movie) {
            const languageList = {
                "en": ['gb', 'us', 'au', 'ca'],
                "uk": ['gb'],
                "fa": ['ir', 'af'],
                "ko": ['kr', 'kp'],
                "zh": ['cn', 'tw'],
                "el": ['gr'],
                "ja": ['jp'],
                "hi": ['in'],
                "ta": ['np'],
                "da": ['dk'],
            };
            let movieLang = movie.original_language;

            if (Object.keys(languageList).includes(movieLang)) {

                return languageList[movieLang][0];
            } else {
                return movieLang;
            }
        },
        getMoviesTv(searchType) {
            const axiosParam = {
                params: {
                    api_key: this.tmdbAPIKey,
                    query: this.userSearch,
                    language: "it-IT"
                }
            };

            axios.get("https://api.themoviedb.org/3/search/" + searchType, axiosParam).then((resp) => {
                /*
                Key da stampare: 
                - title
                - original_title
                - original_language
                - vote_average
                */

                if (searchType === "movie") {

                    this.moviesList = [...resp.data.results];
                } else if (searchType === "tv") {

                    /*
                    SERIE TV TMDB:
                    - name
                    - original_name
                    - original_language
                    - vote_average
                    */
                    const seriesList = [...resp.data.results];

                    this.seriesTv = seriesList.map((tvSeries) => {

                        tvSeries.title = tvSeries.name;
                        tvSeries.original_title = tvSeries.original_name;

                        return tvSeries;
                    });
                }
            });
        },
        searchMessageToPrint() {
            if (this.userSearch) {
                return "In caricamento";
            } else if (this.searchingEnd) {
                return "Nessun risultato";
            }
        },
        addPoster(movieObject) {
            const posterSize = "w154"

            if (!movieObject.poster_path) {
                return "http://www.movienewz.com/img/films/poster-holder.jpg"
            }
            return "https://image.tmdb.org/t/p/" + posterSize + movieObject.poster_path;
        },


    },
})