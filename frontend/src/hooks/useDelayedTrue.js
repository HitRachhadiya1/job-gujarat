import { useEffect, useState } from "react";

export default function useDelayedTrue(flag, delay = 300) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;
    if (flag) {
      timer = setTimeout(() => setShow(true), delay);
    } else {
      setShow(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [flag, delay]);

  return show;
}
