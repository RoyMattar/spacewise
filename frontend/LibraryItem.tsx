import * as React from "react";

type LibraryItemProps = {
  imgSrc: string;
  title: string;
  description: string;
};

function LibraryItem({ imgSrc, title, description }: LibraryItemProps) {
  return (
    <div className="flex flex-wrap gap-6 items-start p-6 mt-6 w-full bg-white rounded-lg border border-solid border-zinc-300 min-w-[240px] max-md:px-5 max-md:max-w-full">
      <img
        loading="lazy"
        src={imgSrc}
        className="object-contain shrink-0 w-40 aspect-square min-h-[160px] min-w-[160px]"
        alt={title}
      />
      <div className="flex flex-col flex-1 shrink basis-0 min-w-[160px] max-md:max-w-full">
        <div className="flex flex-col w-full max-md:max-w-full">
          <div className="tracking-tight leading-tight font-[number:var(--sds-typography-heading-font-weight)] text-[color:var(--sds-color-text-default-default)] text-[length:var(--sds-typography-heading-size-base)] max-md:max-w-full">
            {title}
          </div>
          <div className="mt-2 leading-6 font-[number:var(--sds-typography-body-font-weight-regular)] text-[color:var(--sds-color-text-default-secondary)] text-[length:var(--sds-typography-body-size-medium)] max-md:max-w-full">
            {description}
          </div>
        </div>
        <div className="flex gap-4 items-center mt-4 w-full leading-none whitespace-nowrap font-[number:var(--sds-typography-body-font-weight-regular)] text-[color:var(--sds-color-text-default-default)] text-[length:var(--sds-typography-body-size-medium)] max-md:max-w-full">
          <div className="overflow-hidden gap-2 self-stretch p-3 my-auto rounded-lg border border-solid bg-neutral-200 border-neutral-500">
            Button
          </div>
        </div>
      </div>
    </div>
  );
}

export default LibraryItem;