const app = new Vue({

    el: "#app",
    data: {

        tmdbAPIKey: "ad3dc44159bbda29e23cab3d107aa841",
        userSearch: "",

        currentSearch: "",

        moviesList: [],
        seriesTvList: [],

        moviesTVList: [],

        searchingForQuery: null,

        errorMsg: "",
    },
    methods: {
        onSearchClick() {

            this.currentSearch = this.userSearch

            if (!this.userSearch) {
                return;
            }
            this.searchingForQuery = 0;

            this.getMoviesTv("movie");
            this.getMoviesTv("tv");

            this.userSearch = ""
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
                "te": ['in'],
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

            this.searchingForQuery++
            this.searchMessageToPrint();

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
                    this.searchingForQuery--
                    this.moviesList = [...resp.data.results];

                    this.moviesList.forEach((movie) => {

                        Vue.set(movie, "isMovie", true);
                    })

                    this.convertVote(this.moviesList)


                } else if (searchType === "tv") {
                    /*
                    SERIE TV TMDB:
                    - name
                    - original_name
                    - original_language
                    - vote_average
                    */
                    this.searchingForQuery--
                    const seriesList = [...resp.data.results];
                    
                    this.seriesTvList = seriesList.map((tvSeries) => {

                        tvSeries.title = tvSeries.name;
                        tvSeries.original_title = tvSeries.original_name;

                        return tvSeries;
                    });

                    this.seriesTvList.forEach((serieTv) => {

                        Vue.set(serieTv, "isTVShow", true);
                    })

                    this.convertVote(this.seriesTvList)
                }
                if (this.searchingForQuery == 0) {
                    this.concatOneBigList(this.moviesList, this.seriesTvList)
                }
            });
        },
        concatOneBigList(array1, array2) {
            this.moviesTVList = [];

            this.moviesTVList = array1.concat(array2); 

            if(this.moviesTVList.length > 0) {

                this.getActors(this.moviesTVList);
            }
            this.searchMessageToPrint();
            this.searchingForQuery = null;
        },
        searchMessageToPrint() {
            if (this.searchingForQuery > 0) {
                this.errorMsg = "Sto cercando per te...";
            } else if (this.moviesTVList.length == 0) {
                this.errorMsg = "La ricerca non ha prodotto nessun risultato.";
            }
        },
        // Aggiunge poster, combina il link
        addPoster(movieObject) {
            const posterSize = "w342";

            if (!movieObject.poster_path) {
                return "http://www.movienewz.com/img/films/poster-holder.jpg";
            }
            return "https://image.tmdb.org/t/p/" + posterSize + movieObject.poster_path;
        },
        // Converte il voto da 1/10 a 1/5
        convertVote(listArray) {

            listArray.map((movie) => {
                movie.vote_average = Math.ceil(movie.vote_average / 2);
            });
        },
        // aggiunge una classe text-yellow alle stelle in base al voto
        addStars(movie, starIndex) {
            
            const voteNum = movie.vote_average;

            if (starIndex + 1 <= voteNum) {
                
                return "text-yellow"
            }

        },
        checkIfSame(movieObject) {
            if (movieObject.title === movieObject.original_title) {
                return false 
            }
            return true; 
        },
        getActors(moviesTVList) {
            const axiosParam = {
                params: {
                    api_key: this.tmdbAPIKey,
                    language: "it-IT"
                }
            };
            
            moviesTVList.forEach((movie) => {
                const searchKey = movie.isMovie ? "movie" : "tv";

                axios.get(`https://api.themoviedb.org/3/${searchKey}/${movie.id}/credits`, axiosParam)
                    .then((resp) => {
                        
                        // movie.cast = [...resp.data.cast]
                        Vue.set(movie, "cast", resp.data.cast)
                    })
            })
        },

    },
})