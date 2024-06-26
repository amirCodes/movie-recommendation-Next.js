import MoviePoster from "@/components/MoviePoster";
import db from "@/db";
import { Movie, SimilarMovie } from "@/types";
import Image from "next/image";
import { notFound } from "next/navigation";

// refresh cache every 24 hours
export const revalidate = 60 * 60 * 24;

async function MoviePage({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  const movies = db.collection("movies");

  const search = await movies.find({ $and: [{ _id: id }] });

  if (!(await search.hasNext())) {
    return notFound();
  }

  const movie = (await search.next()) as Movie;

  const similarMovies = (await movies
    .find(
      {},
      {
        vector: movie.$vector,
        limit: 6, // we will cut the first movie and want to show 5 similar movies
        includeSimilarity: true,
      }
    )
    .toArray()) as SimilarMovie[];

  // cut the first movie because it is the same as the movie we are looking for
  similarMovies.shift();

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center gap-y-10 p-10 pb-0">
        <Image
          src={movie.Poster}
          alt={movie.Title}
          width={300}
          height={450}
          className="shrink-0 rounded-lg "
        />
        <div className="px-2 md:px-10 flex flex-col gap-y-2">
          <h1 className="text-6xl font-bold">{movie.Title}</h1>
          <p className="text-gray-200">{movie.Genre}</p>
          <p className="font-light">{movie.$vectorize}</p>

          <div className="mt-auto grid grid-cols-2 float-left">
            <div className="font-normal">
              <p>
                <span className="font-bold  pr-1">Directed by :</span>{" "}
                {movie.Director}{" "}
              </p>
              <p>
                <span className="font-bold  pr-1">Featuring: </span>{" "}
                {movie.Actors}
              </p>
              <p>
                <span className="font-bold  pr-1">Box Office : </span>{" "}
                {movie.BoxOffice}
              </p>
              <p>
                <span className="font-bold  pr-1">Released :</span>{" "}
                {movie.Released}
              </p>
              <p>
                <span className="font-bold  pr-1">Runtime : </span>{" "}
                {movie.Runtime}
              </p>
              <p>
                <span className="font-bold  pr-1">Rated :</span> {movie.Rated}
              </p>
              <p>
                <span className="font-bold  pr-1">IMDB Rating :</span>{" "}
                {movie.imdbRating}
              </p>
              <p>
                <span className="font-bold  pr-1">Language : </span>
                {movie.Language}
              </p>
              <p>
                <span className="font-bold  pr-1">Country : </span>
                {movie.Country}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="">
        <h2 className="text-3xl pt-10 pl-10 font-bold ">
          Similar Films you may like
        </h2>
        <div className="flex justify-between items-center lg:flex-row gap-x-20 gap-y-10 pl-20 pr-10 py-10 overflow-x-scroll">
          {similarMovies.map((movie, i) => (
            <MoviePoster
              key={movie._id}
              index={i + 1}
              //   similarityRating={Number(movie.$similarity.toFixed(2)) * 100}
              movie={movie}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MoviePage;
