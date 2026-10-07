import { useState } from "react";
import EyeIcon from "./EyeIcon";
import TextInput from "./TextInput";

/** TextInput with its own show/hide toggle. */
export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <TextInput {...props} type={show ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-slate-500 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
      >
        <EyeIcon off={show} />
      </button>
    </div>
  );
}
