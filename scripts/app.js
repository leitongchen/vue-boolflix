const app = new Vue({

    el: "#app",
    data: {

        tmdbAPIKey: "ad3dc44159bbda29e23cab3d107aa841",
        userSearch: "",

        moviesList: [],

        languageList: {
            "en": ['gb', 'us', 'au', 'ca'],
            "fa": ['ir', 'af'],
            "ko": ['kr', 'kp'],
            "es": ['ar', 'bo', 'mx', 'co'],
            "cn": ['tw']
        }

    },
    methods: {
        onSearchClick() {

            const axiosParam = {
                params: {
                    api_key: this.tmdbAPIKey,
                    query: this.userSearch,
                    language: "it-IT"
                }
            };

            axios.get("https://api.themoviedb.org/3/search/movie", axiosParam).then((resp) => {
                /*
                Key da stampare: 
                - title
                - original_title
                - original_language
                - vote_average
                */

                this.moviesList = [...resp.data.results]
                console.log(this.moviesList) 
            })

        },
        getFlagIcon(movie) {

            const languageList = {
                "en": ['gb', 'us', 'au', 'ca'],
                "uk": ['gb'],
                "fa": ['ir', 'af'],
                "ko": ['kr', 'kp'],
                "zh": ['cn', 'tw'],
                "el": ['gr'],
                "ja": ['jp']

            }

            let movieLang = movie.original_language;

            if (Object.keys(languageList).includes(movieLang)) {
                console.log(languageList[movieLang][0])

                return languageList[movieLang][0]
            } else {
                return movieLang;
            }

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