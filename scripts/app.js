const app = new Vue({

    el: "#app",
    data: {
        axiosParam: {
            params: {
                api_key: "ad3dc44159bbda29e23cab3d107aa841",
                language: "it-IT"
            }
        },
        userSearch: "",

        currentSearch: "",

        moviesList: [],
        seriesTvList: [],

        moviesTVList: [],

        genresList: [],

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

        // ritorna la sigla per stabilire la bandiera da associare alla lingua del film
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

        // chiamata ajax per cercare movies o tv series nel database
        getMoviesTv(searchType) {

            this.searchingForQuery++
            this.searchMessageToPrint();

            const axiosParam = {
                params: {
                    ...this.axiosParam.params,
                    query: this.userSearch,
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
                    //converte il voto in 1/5
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
                    
                    // trasforma alcune chiavi delle serietv per farle uguali a quelle di movies
                    this.seriesTvList = seriesList.map((tvSeries) => {

                        tvSeries.title = tvSeries.name;
                        tvSeries.original_title = tvSeries.original_name;

                        return tvSeries;
                    });

                    this.seriesTvList.forEach((serieTv) => {
                        Vue.set(serieTv, "isTVShow", true);
                    })
                    //converte il voto in 1/5
                    this.convertVote(this.seriesTvList)
                }
                // invoca la funzione che concatena i due array
                if (this.searchingForQuery == 0) {
                    this.concatOneBigList(this.moviesList, this.seriesTvList)
                }
            });
        },

        // riunisce in un unica variabile le due array di movie e tv series
        // viene invocata la funzione che aggiunge l'array del CAST
        concatOneBigList(array1, array2) {
            this.moviesTVList = [];

            this.moviesTVList = array1.concat(array2); 

            if(this.moviesTVList.length > 0) {

                this.getActors(this.moviesTVList);
            }
            this.searchMessageToPrint();
            this.searchingForQuery = null;
        },

        // Funzione richiamata più volte nel corso dell'elaborazione dei dati API
        // Restituisce un messaggio per l'utente
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

        //controlla se il titolo del film o serie è uguale al titolo originale
        // se sì, ritorna false, e il titolo originale non viene stampato
        checkIfSame(movieObject) {
            if (movieObject.title === movieObject.original_title) {
                return false 
            }
            return true; 
        },

        // Fa una chiamata ajax per reperire il nome degli attori per ciascun film
        // I nomi ricavati vengono inseriti direttamente in moviesTVList
        getActors(moviesTVList) {  
            moviesTVList.forEach((movie) => {
                const searchKey = movie.isMovie ? "movie" : "tv";

                axios.get(`https://api.themoviedb.org/3/${searchKey}/${movie.id}/credits`, this.axiosParam)
                    .then((resp) => {
                        
                        Vue.set(movie, "cast", resp.data.cast)
                    })
            })
        },

        // fa una comparazione tra i codici dei generi del film preso in esame con 
        // l'elenco di tutti i generi in "this.genresList"
        // ritorna i nomi dei generi riferiti al film preso in esame
        getGenres(movie) {
            const movieGenres = movie.genre_ids
            let genresToPrint = [];

            this.genresList.forEach((genre) => {

                movieGenres.forEach((genreThisMovie) => {

                    if (genre.id == genreThisMovie && !genresToPrint.includes(genre.name)) {
                        genresToPrint.push(genre.name)
                    }
                })
            })
            return genresToPrint.join(", ");
        },

        // chiamata ajax per salvare nella variabile in data "this.genresList"
        // tutti i generi (codice e nome) disponibili
        // sia di tipo "movie" che "tv"
        // la funzione viene chiamata in mounted
        ajaxGenreLists(listType) {

            axios.get(`https://api.themoviedb.org/3/genre/${listType}/list`, this.axiosParam)
            .then((resp) => {

                this.genresList.push(...resp.data.genres)
            })
        },
    },
    mounted() {
        this.ajaxGenreLists("movie");
        this.ajaxGenreLists("tv");
    }
})