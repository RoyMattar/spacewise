/*
import * as React from "react";
import Navbar from './Navbar';
import LibraryItem from './LibraryItem';

const libraries = [
  {
    imgSrc: "https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/5b8793effea623db17f753b28b7448a41bdda9c977ed28634f4d211ed27320c7?apiKey=dac6f779a9c045318e74a75e657f7b91&",
    title: "Library 1",
    description:
      "Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.",
  },
  {
    imgSrc: "https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/5b8793effea623db17f753b28b7448a41bdda9c977ed28634f4d211ed27320c7?apiKey=dac6f779a9c045318e74a75e657f7b91&",
    title: "Library 2",
    description:
      "Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.",
  },
  {
    imgSrc: "https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/5b8793effea623db17f753b28b7448a41bdda9c977ed28634f4d211ed27320c7?apiKey=dac6f779a9c045318e74a75e657f7b91&",
    title: "Library 3",
    description:
      "Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.",
  },
];

function MyComponent() {
  return (
    <div className="flex flex-col pb-20">
      <Navbar />
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/6a43296e739f3fb7d6de0c3624e227f1d04fe94a0e769a218548c7b4ca9efafe?apiKey=dac6f779a9c045318e74a75e657f7b91&"
        className="object-contain z-10 mt-48 ml-20 max-w-full aspect-[1.07] w-[173px] max-md:mt-10 max-md:ml-2.5"
        alt="Decorative image"
      />
      <div className="flex flex-col p-16 mt-0 w-full bg-white max-md:px-5 max-md:mt-0 max-md:max-w-full">
        <div className="max-w-full tracking-tight leading-tight font-[number:var(--sds-typography-heading-font-weight)] text-[color:var(--sds-color-text-default-default)] text-[length:var(--sds-typography-heading-size-base)] w-[151px]">
          Find Libraries
        </div>
        <div className="flex flex-col mt-12 w-full max-md:mt-10 max-md:max-w-full">
          {libraries.map((library, index) => (
            <LibraryItem
              key={index}
              imgSrc={library.imgSrc}
              title={library.title}
              description={library.description}
            />
          ))}
        </div>
      </div>
      <div className="flex z-10 flex-col mt-0 ml-20 w-44 max-w-full max-md:mt-0 max-md:ml-2.5">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/6a43296e739f3fb7d6de0c3624e227f1d04fe94a0e769a218548c7b4ca9efafe?apiKey=dac6f779a9c045318e74a75e657f7b91&"
          className="object-contain w-full aspect-[1.07]"
          alt="Decorative image"
        />
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/6a43296e739f3fb7d6de0c3624e227f1d04fe94a0e769a218548c7b4ca9efafe?apiKey=dac6f779a9c045318e74a75e657f7b91&"
          className="object-contain mt-16 w-full aspect-[1.07] max-md:mt-10"
          alt="Decorative image"
        />
      </div>
    </div>
  );
}

export default MyComponent;
*/
import * as React from "react";
import Navbar from './Navbar';
import LibraryItem from './LibraryItem';

const libraries = [
  {
    imgSrc: "https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/5b8793effea623db17f753b28b7448a41bdda9c977ed28634f4d211ed27320c7?apiKey=dac6f779a9c045318e74a75e657f7b91&",
    title: "Library 1",
    description:
      "Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.",
  },
  {
    imgSrc: "https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/5b8793effea623db17f753b28b7448a41bdda9c977ed28634f4d211ed27320c7?apiKey=dac6f779a9c045318e74a75e657f7b91&",
    title: "Library 2",
    description:
      "Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.",
  },
  {
    imgSrc: "https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/5b8793effea623db17f753b28b7448a41bdda9c977ed28634f4d211ed27320c7?apiKey=dac6f779a9c045318e74a75e657f7b91&",
    title: "Library 3",
    description:
      "Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.",
  },
];

function MyComponent() {
  return (
    <div className="flex flex-col pb-20">
      <Navbar />
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/6a43296e739f3fb7d6de0c3624e227f1d04fe94a0e769a218548c7b4ca9efafe?apiKey=dac6f779a9c045318e74a75e657f7b91&"
        className="object-contain z-10 mt-48 ml-20 max-w-full aspect-[1.07] w-[173px] max-md:mt-10 max-md:ml-2.5"
        alt="Decorative image"
      />
      <div className="flex flex-col p-16 mt-0 w-full bg-white max-md:px-5 max-md:mt-0 max-md:max-w-full">
        <div className="max-w-full tracking-tight leading-tight font-[number:var(--sds-typography-heading-font-weight)] text-[color:var(--sds-color-text-default-default)] text-[length:var(--sds-typography-heading-size-base)] w-[151px]">
          Find Libraries
        </div>
        <div className="flex flex-col mt-12 w-full max-md:mt-10 max-md:max-w-full">
          {libraries.map((library, index) => (
            <LibraryItem
              key={index}  // This is handled by React, so no need to pass it explicitly in LibraryItemProps
              imgSrc={library.imgSrc}
              title={library.title}
              description={library.description}
            />
          ))}
        </div>
      </div>
      <div className="flex z-10 flex-col mt-0 ml-20 w-44 max-w-full max-md:mt-0 max-md:ml-2.5">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/6a43296e739f3fb7d6de0c3624e227f1d04fe94a0e769a218548c7b4ca9efafe?apiKey=dac6f779a9c045318e74a75e657f7b91&"
          className="object-contain w-full aspect-[1.07]"
          alt="Decorative image"
        />
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/6a43296e739f3fb7d6de0c3624e227f1d04fe94a0e769a218548c7b4ca9efafe?apiKey=dac6f779a9c045318e74a75e657f7b91&"
          className="object-contain mt-16 w-full aspect-[1.07] max-md:mt-10"
          alt="Decorative image"
        />
      </div>
    </div>
  );
}

export default MyComponent;
