import { redirect } from "next/navigation";

// /host has no page of its own; the control panel sends you to the login
// if you aren't signed in.
export default function HostIndex() {
  redirect("/host/control");
}
