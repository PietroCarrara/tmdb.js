import { Movie, TheMovieDB } from "./tmdb";

class TheMovieDBCacheProxy extends TheMovieDB {

    constructor(key, lang) {
        super(key, lang);

        this.movie = new MovieCache(this);
    }
}

class MovieCache extends Movie {

    constructor(tmdb) {
        super(tmdb);

        this.detailsCache = {};
        this.simpleDetailsCache = {};
    }

    async getDetails(id) {
        if (this.detailsCache[id]) {
            return this.detailsCache[id];
        }

        var details = await super.getDetails(id);
        this.detailsCache[id] = details;
        this.simpleDetailsCache[id] = details;

        return details;
    }

    async getSimpleDetails(id) {
        if (this.simpleDetailsCache[id]) {
            return this.simpleDetailsCache[id];
        }

        return this.getDetails(id);
    }

    async getRecommended(id, page) {
        var recommended = await super.getRecommended(id, page);

        for (var movie of recommended.response.results) {
            this.simpleDetailsCache[movie.id] = movie;
        }

        return recommended;
    }

    async getSimilar(id, page) {
        var similar = await super.getSimilar(id, page);

        for (var movie of similar.response.results) {
            this.simpleDetailsCache[movie.id] = movie;
        }

        return similar;
    }

    async getPopular(page) {
        var popular = await super.getPopular(page);

        for (var movie of popular.response.results) {
            this.simpleDetailsCache[movie.id] = movie;
        }

        return popular;
    }
}

export {
    TheMovieDBCacheProxy,
};