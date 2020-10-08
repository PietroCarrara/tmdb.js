import { Movie, TheMovieDB, TV } from "./tmdb";

class TheMovieDBCacheProxy extends TheMovieDB {

    constructor(key, lang) {
        super(key, lang);

        this.movie = new MovieCache(this);
        this.tv = new TVCache(this);
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

class TVCache extends TV {
    constructor(tmdb) {
        super(tmdb);

        this.detailsCache = {};
        this.simpleDetailsCache = {};
        this.seasonDetails = {};
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

        for (var show of recommended.response.results) {
            this.simpleDetailsCache[show.id] = show;
        }

        return recommended;
    }

    async getSimilar(id, page) {
        var similar = await super.getSimilar(id, page);

        for (var show of similar.response.results) {
            this.simpleDetailsCache[show.id] = show;
        }

        return similar;
    }

    async getPopular(page) {
        var popular = await super.getPopular(page);

        for (var show of popular.response.results) {
            this.simpleDetailsCache[show.id] = show;
        }

        return popular;
    }

    async getSeasonDetails(id, seasonNumber) {
        if (!this.seasonDetails[id]) {
            this.seasonDetails[id] = {};
        }

        if (this.seasonDetails[id][seasonNumber]) {
            return this.seasonDetails[id][seasonNumber];
        }

        var details = await super.getSeasonDetails(id, seasonNumber);
        this.seasonDetails[id][seasonNumber] = details;

        return details;
    }
}

export {
    TheMovieDBCacheProxy,
};