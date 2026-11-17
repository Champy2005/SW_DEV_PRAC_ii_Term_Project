import Link from "next/link";
import { redirect } from "next/navigation";
import { RegistrationsList } from "@/components/registrations-list";
import { getUser } from "@/lib/session";
import { serverApi } from "@/lib/server";
import type { Registration, Workshop } from "@/lib/types";
import {
  ACTIVE_REGISTRATION_LIMIT,
  countActiveRegistrations,
} from "@/lib/rules";

export const metadata = { title: "Registrations" };

interface RegistrationsPageProps {
  searchParams: Promise<{ registered?: string | string[] }>;
}

export default async function RegistrationsPage({
  searchParams,
}: RegistrationsPageProps) {
  const user = await getUser();
  if (!user) redirect("/login");

  const [registrations, workshops, params] = await Promise.all([
    serverApi<Registration[]>("/registrations"),
    serverApi<Workshop[]>("/workshops"),
    searchParams,
  ]);
  const admin = user.role === "admin";
  const activeCount = countActiveRegistrations(registrations);

  // A query string is a navigation hint, not evidence of a successful write.
  // The member's authorized API result must still contain the registration.
  const confirmedRegistration =
    !admin && typeof params.registered === "string"
      ? registrations.find(
          (registration) => registration._id === params.registered,
        )
      : undefined;

  return (
    <div className="page-width dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">
            {admin ? "THE WHOLE TABLE" : "A LITTLE TIME FOR YOU"}
          </p>
          <h1>{admin ? "All registrations." : "Your plans, taking shape."}</h1>
          <p>
            {admin
              ? "View member registrations, move a booking, or release a place."
              : `You have ${activeCount} of ${ACTIVE_REGISTRATION_LIMIT} active workshop registrations. Your next experience is right here.`}
          </p>
        </div>
        <Link href="/" className="button button-secondary">
          Explore workshops <span aria-hidden="true">↗</span>
        </Link>
      </div>

      {confirmedRegistration && (
        <p className="form-success" role="status">
          You’re registered! Reference ID{" "}
          <code>{confirmedRegistration._id}</code>. Your workshop details are
          below.
        </p>
      )}

      <RegistrationsList
        registrations={registrations}
        workshops={workshops}
        user={user}
      />
      <p className="dashboard-footnote">
        Dates are shown in UTC. Workshop capacity is the total group size.
      </p>
    </div>
  );
}
