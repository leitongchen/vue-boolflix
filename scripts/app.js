const app = new Vue({

    el: "#app",
    data: {

        tmdbAPIKey: "ad3dc44159bbda29e23cab3d107aa841",
        userSearch: "",

        moviesList: [],
        seriesTv: [],

    },
    methods: {
        onSearchClick() {

            this.getMoviesTv("movie");
            this.getMoviesTv("tv");
        


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
            }

            let movieLang = movie.original_language;

            if (Object.keys(languageList).includes(movieLang)) {
                console.log(languageList[movieLang][0])

                return languageList[movieLang][0]
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

                    this.moviesList = [...resp.data.results]
                } else if (searchType === "tv") {
                    
                    const seriesList = [...resp.data.results]
                    
                    this.seriesTv = seriesList.map((tvSeries) => {
                        
                        tvSeries.title = tvSeries.name;
                        tvSeries.original_title = tvSeries.original_name;

                        return tvSeries;
                    })

                    console.log(this.seriesTv)
                    
                }
            })

            /*
            SERIE TV TMDB:
            - name
            - original_name
            - original_language
            - vote_average
            */

            // convertire le chiavi delle serie = chiavi film

        }

    },
    mounted() {
        // axios.get("https://api.themoviedb.org/3/search/movie", {

        //     params: {
        //         api_key: this.tmdbAPIKey,
        //         query: this.userSearch,
        //         language: "it-IT"
        //     }

        // }).then((resp) => {
        //     console.log("ciao");
        //     console.log(resp);
        // });

    }
})