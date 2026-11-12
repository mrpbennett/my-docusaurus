// Wraps @theme-original/Navbar.
// Adds the status strip (homelab + home-ops last commit) under the navbar.
// The navbar stays sticky; the strip scrolls away with the page.
import React from "react";
import Navbar from "@theme-original/Navbar";
import StatusStrip from "@site/src/components/StatusStrip";

export default function NavbarWrapper(props) {
  return (
    <>
      <Navbar {...props} />
      <StatusStrip />
    </>
  );
}
