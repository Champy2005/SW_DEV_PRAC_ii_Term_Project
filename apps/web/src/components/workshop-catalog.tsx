"use client";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { Workshop } from "@/lib/types";
import { formatWorkshopDate, todayUtc } from "@/lib/rules";
import type { RootState } from "@/store";
import { ArrowIcon, CalendarIcon, PinIcon } from "./icons";
import { SaveButton } from "./save-button";
import { WorkshopArt } from "./workshop-art";

export function WorkshopCatalog({
  workshops,
  search,
}: {
  workshops: Workshop[];
  search: string;
}) {
  const [savedOnly, setSavedOnly] = useState(false);
  const savedIds = useSelector((state: RootState) => state.savedWorkshops.ids);
  const visible = savedOnly
    ? workshops.filter((item) => savedIds.includes(item._id))
    : workshops;
  return (
    <section className="catalog-section" aria-labelledby="catalog-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FIND YOUR NEXT THING</p>
          <h2 id="catalog-title">
            {search ? `Results for “${search}”` : "Good things start here."}
          </h2>
        </div>
        <div className="filter-tabs" aria-label="Workshop filters">
          <button
            type="button"
            aria-pressed={!savedOnly}
            className={!savedOnly ? "active" : ""}
            onClick={() => setSavedOnly(false)}
          >
            All workshops <span>{workshops.length}</span>
          </button>
          <button
            type="button"
            aria-pressed={savedOnly}
            className={savedOnly ? "active" : ""}
            onClick={() => setSavedOnly(true)}
          >
            Saved{" "}
            <span>
              {workshops.filter((w) => savedIds.includes(w._id)).length}
            </span>
          </button>
        </div>
      </div>
      {visible.length ? (
        <div className="workshop-grid">
          {visible.map((workshop, index) => (
            <article className="workshop-card" key={workshop._id}>
              <div className="card-art-wrap">
                <Link
                  href={`/workshops/${workshop._id}`}
                  aria-label={`View ${workshop.name}`}
                  tabIndex={-1}
                >
                  <WorkshopArt index={index} />
                </Link>
                <SaveButton id={workshop._id} name={workshop.name} />
                <span className="art-label">
                  {!workshop.isActive
                    ? "Currently unavailable"
                    : workshop.workshopDate.slice(0, 10) < todayUtc()
                      ? "Past workshop"
                      : "Make something new"}
                </span>
              </div>
              <div className="card-body">
                <p className="instructor">WITH {workshop.instructor}</p>
                <h3>
                  <Link href={`/workshops/${workshop._id}`}>
                    {workshop.name}
                  </Link>
                </h3>
                <p className="card-description">{workshop.description}</p>
                <div className="card-meta">
                  <span>
                    <CalendarIcon />
                    {formatWorkshopDate(workshop.workshopDate)}
                  </span>
                  <span>
                    <PinIcon />
                    {workshop.location}
                  </span>
                </div>
                <div className="card-bottom">
                  <span>{workshop.capacity} places total</span>
                  <Link
                    href={`/workshops/${workshop._id}`}
                    className="card-link"
                  >
                    View workshop <ArrowIcon />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-symbol" aria-hidden="true">
            ✳
          </span>
          <h3>
            {savedOnly
              ? "Make a little room for later."
              : "No workshops found."}
          </h3>
          <p>
            {savedOnly
              ? "Tap the bookmark on a workshop to keep it here on this device."
              : search
                ? "Try another search to discover your next workshop."
                : "New experiences are on their way. Check back soon."}
          </p>
          {search && !savedOnly && (
            <Link className="button button-secondary" href="/">
              Clear search
            </Link>
          )}
          {savedOnly && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setSavedOnly(false)}
            >
              Explore all workshops
            </button>
          )}
        </div>
      )}
    </section>
  );
}
