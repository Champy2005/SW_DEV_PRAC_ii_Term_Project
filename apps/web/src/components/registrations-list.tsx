"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { api } from "@/lib/api";
import { formatWorkshopDate, isUpcoming } from "@/lib/rules";
import type { Registration, User, Workshop } from "@/lib/types";
import { CalendarIcon, PinIcon } from "./icons";

type RegistrationStatus = "upcoming" | "past" | "unavailable";

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  upcoming: "Upcoming",
  past: "Past",
  unavailable: "Workshop unavailable",
};

/** Upcoming first, then cancelled workshops, then history. */
const STATUS_ORDER: Record<RegistrationStatus, number> = {
  upcoming: 0,
  unavailable: 1,
  past: 2,
};

/**
 * Same UTC date policy as the API's active-registration rule. A finished
 * workshop stays "past" even if it is deleted later, so history stays fixed.
 */
function registrationStatus(workshop: Workshop | null): RegistrationStatus {
  if (!workshop) return "unavailable";
  if (!isUpcoming(workshop.workshopDate)) return "past";
  return workshop.isActive ? "upcoming" : "unavailable";
}

interface Notice {
  id: number;
  text: string;
}

export function RegistrationsList({
  registrations,
  workshops,
  user,
}: {
  registrations: Registration[];
  workshops: Workshop[];
  user: User;
}) {
  const admin = user.role === "admin";
  // Lives here, not in the item: a cancelled item unmounts with its own state.
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (notice) noticeRef.current?.focus();
  }, [notice]);

  // Workshops each owner already holds, so a move only offers real options.
  const heldByOwner = new Map<string, Set<string>>();
  for (const registration of registrations) {
    if (!registration.user || !registration.workshop) continue;
    const held = heldByOwner.get(registration.user._id) ?? new Set<string>();
    held.add(registration.workshop._id);
    heldByOwner.set(registration.user._id, held);
  }

  // Sorting is stable, so the API's creation order holds within each group.
  const ordered = [...registrations].sort(
    (a, b) =>
      STATUS_ORDER[registrationStatus(a.workshop)] -
      STATUS_ORDER[registrationStatus(b.workshop)],
  );

  return (
    <>
      {notice && (
        <p
          key={notice.id}
          ref={noticeRef}
          className="form-success registrations-notice"
          role="status"
          tabIndex={-1}
        >
          {notice.text}
        </p>
      )}
      {ordered.length ? (
        <div className="registrations-list">
          {ordered.map((registration) => (
            <RegistrationItem
              key={registration._id}
              registration={registration}
              workshops={workshops}
              admin={admin}
              held={
                registration.user
                  ? heldByOwner.get(registration.user._id)
                  : undefined
              }
              onChanged={(text) => setNotice({ id: Date.now(), text })}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-symbol" aria-hidden="true">
            ✳
          </span>
          <h2>
            {admin
              ? "The next chapter starts with a registration."
              : "Your next experience is waiting."}
          </h2>
          <p>
            {admin
              ? "Registrations will appear here as members join a workshop."
              : "Find a workshop you love, reserve your place, and we’ll keep the details here."}
          </p>
          <Link href="/" className="button">
            Explore workshops <span aria-hidden="true">↗</span>
          </Link>
        </div>
      )}
    </>
  );
}

function RegistrationItem({
  registration,
  workshops,
  admin,
  held,
  onChanged,
}: {
  registration: Registration;
  workshops: Workshop[];
  admin: boolean;
  /** Workshop IDs this registration's owner already holds. */
  held?: Set<string>;
  onChanged: (message: string) => void;
}) {
  const router = useRouter();
  const [action, setAction] = useState<"move" | "cancel" | null>(null);
  const [workshopId, setWorkshopId] = useState("");
  const [saving, setSaving] = useState(false);
  // Stays pending until the refreshed server data has replaced the old card.
  const [refreshing, startRefresh] = useTransition();
  const [error, setError] = useState("");
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const moveButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const pending = saving || refreshing;
  const workshop = registration.workshop;
  const status = registrationStatus(workshop);
  const workshopName = workshop?.name ?? "this workshop";
  const ownerName = registration.user?.name ?? "this member";
  const panelId = `registration-panel-${registration._id}`;
  // Members cannot rewrite history; admins may still delete a past record.
  const canMove = status !== "past";
  const canCancel = status !== "past" || admin;
  const options = workshops.filter(
    (item) =>
      item.isActive &&
      isUpcoming(item.workshopDate) &&
      item._id !== workshop?._id &&
      !held?.has(item._id),
  );

  useEffect(() => {
    if (action) panelHeadingRef.current?.focus();
  }, [action]);

  function openPanel(next: "move" | "cancel") {
    setAction(action === next ? null : next);
    // A previous move's destination is no longer an option; start empty.
    setWorkshopId("");
    setError("");
  }

  function closePanel() {
    const trigger = action === "move" ? moveButtonRef : cancelButtonRef;
    setAction(null);
    setWorkshopId("");
    setError("");
    trigger.current?.focus();
  }

  async function mutate(method: "PUT" | "DELETE") {
    const destination = options.find((item) => item._id === workshopId)?.name;
    setSaving(true);
    setError("");
    try {
      await api(`/registrations/${registration._id}`, {
        method,
        ...(method === "PUT"
          ? { body: JSON.stringify({ workshop: workshopId }) }
          : {}),
      });
      setAction(null);
      setWorkshopId("");
      onChanged(
        method === "DELETE"
          ? admin
            ? `${ownerName}’s registration for ${workshopName} is cancelled.`
            : `Your registration for ${workshopName} is cancelled, and your place has been released.`
          : admin
            ? `Moved ${ownerName} to ${destination}.`
            : `Moved to ${destination}. Your reference ID stays the same.`,
      );
      startRefresh(() => router.refresh());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update this registration.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <article
      className="registration-card"
      aria-label={workshop?.name ?? "Unavailable workshop registration"}
    >
      <div className="registration-overview">
        <div className="registration-icon" aria-hidden="true">
          ✳
        </div>
        <div className="registration-details">
          <h2>
            {workshop?.isActive ? (
              <Link href={`/workshops/${workshop._id}`}>{workshop.name}</Link>
            ) : (
              (workshop?.name ?? "Workshop no longer available")
            )}
          </h2>
          <div className="inline-meta">
            <span className={`registration-status is-${status}`}>
              {STATUS_LABEL[status]}
            </span>
            {workshop && (
              <>
                <span>
                  <CalendarIcon />
                  {formatWorkshopDate(workshop.workshopDate)}
                </span>
                <span>
                  <PinIcon />
                  {workshop.location}
                </span>
              </>
            )}
          </div>
          {admin && (
            <p className="attendee">
              Registered by{" "}
              <strong>{registration.user?.name ?? "Deleted member"}</strong>
              {registration.user?.email && <> · {registration.user.email}</>}
              {registration.user?.tel && <> · {registration.user.tel}</>}
            </p>
          )}
          <p className="registration-ref">
            Reference ID <code>{registration._id}</code>
          </p>
        </div>
        {(canMove || canCancel) && (
          <div className="registration-controls">
            {canMove && (
              <button
                ref={moveButtonRef}
                type="button"
                className="button button-secondary button-small"
                disabled={pending}
                aria-expanded={action === "move"}
                aria-controls={action === "move" ? panelId : undefined}
                onClick={() => openPanel("move")}
              >
                Change workshop
              </button>
            )}
            {canCancel && (
              <button
                ref={cancelButtonRef}
                type="button"
                className="text-button text-danger"
                disabled={pending}
                aria-expanded={action === "cancel"}
                aria-controls={action === "cancel" ? panelId : undefined}
                onClick={() => openPanel("cancel")}
              >
                Cancel registration
              </button>
            )}
          </div>
        )}
      </div>
      {action === "cancel" && (
        <div className="inline-panel" id={panelId}>
          <h3 ref={panelHeadingRef} tabIndex={-1}>
            {admin
              ? `Cancel ${ownerName}’s registration?`
              : "Cancel this registration?"}
          </h3>
          <p>
            {admin
              ? `Their place in ${workshopName} will be released. They can register again later if a place is still available.`
              : `Your place in ${workshopName} will be released. You can register again later if a place is still available.`}
          </p>
          <div className="button-row">
            <button
              type="button"
              className="button button-danger button-small"
              disabled={pending}
              onClick={() => mutate("DELETE")}
            >
              {pending ? "Cancelling…" : "Yes, cancel registration"}
            </button>
            <button
              type="button"
              className="button button-secondary button-small"
              disabled={pending}
              onClick={closePanel}
            >
              Keep registration
            </button>
          </div>
        </div>
      )}
      {action === "move" && (
        <form
          className="inline-panel"
          id={panelId}
          onSubmit={(event) => {
            event.preventDefault();
            void mutate("PUT");
          }}
        >
          <h3 ref={panelHeadingRef} tabIndex={-1}>
            {admin
              ? `Move ${ownerName} to another workshop`
              : "Move to another workshop"}
          </h3>
          {options.length ? (
            <>
              <p>
                {admin
                  ? `Their place in ${workshopName} is released only if the move succeeds. The reference ID stays the same.`
                  : `Your place in ${workshopName} is released only if the move succeeds. Your reference ID stays the same.`}
              </p>
              <div className="field">
                <label htmlFor={`move-${registration._id}`}>
                  Choose a workshop
                </label>
                <select
                  id={`move-${registration._id}`}
                  value={workshopId}
                  onChange={(event) => setWorkshopId(event.target.value)}
                  required
                  disabled={pending}
                >
                  <option value="">Select a workshop</option>
                  {options.map((item) => (
                    <option value={item._id} key={item._id}>
                      {item.name} — {formatWorkshopDate(item.workshopDate)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="button-row">
                <button
                  className="button button-small"
                  disabled={pending || !workshopId}
                  type="submit"
                >
                  {pending ? "Moving registration…" : "Move registration"}
                </button>
                <button
                  className="button button-secondary button-small"
                  disabled={pending}
                  type="button"
                  onClick={closePanel}
                >
                  Keep current workshop
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                There are no other upcoming workshops to move to right now.
              </p>
              <button
                className="button button-secondary button-small"
                type="button"
                onClick={closePanel}
              >
                Keep current workshop
              </button>
            </>
          )}
        </form>
      )}
      {error && (
        <p className="form-error registration-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
