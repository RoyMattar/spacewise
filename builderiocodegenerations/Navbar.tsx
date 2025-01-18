import * as React from "react";

function Navbar() {
  return (
    <div className="flex overflow-hidden flex-col w-full bg-white max-md:max-w-full">
      <div className="flex w-full max-md:max-w-full">
        <div className="flex overflow-hidden flex-wrap gap-6 items-center p-8 h-full bg-white border-b border-zinc-300 w-[1200px] max-md:px-5 max-md:max-w-full">
          <div className="flex gap-6 items-center self-stretch my-auto w-10">
            <div className="flex justify-center items-center self-stretch my-auto w-10">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/dac6f779a9c045318e74a75e657f7b91/585afbb2ce9a1ba710f8f4a970e5d059a365de7c6ebe2724a2f4b108f9998b05?apiKey=dac6f779a9c045318e74a75e657f7b91&"
                className="object-contain self-stretch my-auto w-6 aspect-[0.69]"
                alt="Logo"
              />
            </div>
          </div>
          <div className="flex flex-wrap flex-1 shrink gap-2 items-start self-stretch my-auto leading-none whitespace-nowrap basis-0 font-[number:var(--sds-typography-body-font-weight-regular)] min-w-[240px] text-[color:var(--sds-color-text-default-default)] text-[length:var(--sds-typography-body-size-medium)] max-md:max-w-full">
            <div className="gap-2 self-stretch p-2 rounded-lg">Admin</div>
          </div>
          <div className="flex gap-3 items-center self-stretch my-auto leading-none font-[number:var(--sds-typography-body-font-weight-regular)] text-[length:var(--sds-typography-body-size-medium)] w-[178px]">
            <div className="overflow-hidden flex-1 shrink gap-2 self-stretch p-2 my-auto rounded-lg border border-solid bg-neutral-200 border-neutral-500 text-[color:var(--sds-color-text-default-default)]">
              Sign in
            </div>
            <div className="overflow-hidden flex-1 shrink gap-2 self-stretch p-2 my-auto whitespace-nowrap rounded-lg border border-solid bg-zinc-800 border-zinc-800 text-[color:var(--sds-color-text-brand-on-brand)]">
              Register
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;