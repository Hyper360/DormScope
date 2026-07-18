"use strict";

const DEFAULT_RATING = 3;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 60;
const MIN_COMMENT_LENGTH = 20;
const MAX_COMMENT_LENGTH = 1000;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".rate-form");
  if (!form) {
    return;
  }

  const authorNameInput = document.getElementById("author-name");
  const ratingInput = document.getElementById("rating");
  const commentInput = document.getElementById("comment");
  const submitButton = form.querySelector(".rate-submit");
  const contextText = document.querySelector(".rate-context");

  const feedbackBox = createFeedbackBox();
  const hintBox = createHintBox();
  const counter = createCommentCounter();
  const ratingPreview = createRatingPreview();
  const reviewFeed = ensureReviewFeed();

  form.prepend(feedbackBox);
  form.append(hintBox);
  commentInput?.insertAdjacentElement("afterend", counter);
  ratingInput?.insertAdjacentElement("afterend", ratingPreview);

  updateCommentCounter(commentInput, counter);
  updateRatingPreview(ratingInput, ratingPreview);
  setHint(hintBox, "Write a thoughtful review and submit when all fields look good.");

  const listingContext = getListingContext();
  renderListingContext(contextText, listingContext);

  attachValidation(authorNameInput, validateAuthorName);
  attachValidation(ratingInput, validateRating);
  attachValidation(commentInput, validateComment);

  ratingInput?.addEventListener("input", () => {
    updateRatingPreview(ratingInput, ratingPreview);
  });

  commentInput?.addEventListener("input", () => {
    updateCommentCounter(commentInput, counter);
  });

  const supabase = getSupabaseClient();
  if (!supabase) {
    setFeedback(
      feedbackBox,
      "error",
      "Supabase could not be loaded. Check your connection and refresh the page."
    );
  } else if (!listingContext.id && !listingContext.slug) {
    setFeedback(
      feedbackBox,
      "warning",
      "Open this page from a listing so DormScope knows which dorm you are reviewing."
    );
    hydrateRecentReviews(supabase, reviewFeed, null);
  } else {
    hydrateListingName(supabase, listingContext, contextText, feedbackBox);
    hydrateRecentReviews(supabase, reviewFeed, listingContext);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearFieldErrors(form);
    setFeedback(feedbackBox, "", "");

    const review = {
      authorName: authorNameInput?.value.trim() || "",
      rating: Number(ratingInput?.value || ""),
      comment: commentInput?.value.trim() || ""
    };

    const errors = validateReview(review);
    if (errors.length > 0) {
      showValidationErrors(errors, feedbackBox, {
        authorNameInput,
        ratingInput,
        commentInput
      });
      setHint(hintBox, "Fix the highlighted fields and try again.");
      return;
    }

    if (!supabase) {
      setFeedback(
        feedbackBox,
        "error",
        "Supabase is unavailable right now, so the review could not be saved."
      );
      setHint(hintBox, "Refresh the page and try again.");
      return;
    }

    let listing = listingContext;
    if (!listing.id) {
      try {
        listing = await findListing(supabase, listingContext);
      } catch (error) {
        setFeedback(
          feedbackBox,
          "error",
          error instanceof Error ? error.message : "Could not find the dorm listing."
        );
        setHint(hintBox, "Open the review page from a listing and try again.");
        return;
      }
    }

    if (!listing?.id) {
      setFeedback(
        feedbackBox,
        "error",
        "DormScope could not figure out which dorm this review belongs to."
      );
      setHint(hintBox, "Go back to the listing page and open the review form again.");
      return;
    }

    toggleSubmitting(submitButton, true);
    setHint(hintBox, "Submitting your review...");

    try {
      const payload = {
        listing_id: listing.id,
        author_name: review.authorName,
        rating: review.rating,
        comment: review.comment
      };

      const { data, error } = await supabase
        .from("reviews")
        .insert(payload)
        .select("author_name, rating, comment, created_at")
        .single();

      if (error) {
        throw new Error(friendlySupabaseError(error.message));
      }

      prependReviewCard(reviewFeed, {
        ...data,
        listing_name: listing.name || listing.slug || "Dorm listing"
      });

      form.reset();
      if (ratingInput) {
        ratingInput.value = String(DEFAULT_RATING);
      }
      updateCommentCounter(commentInput, counter);
      updateRatingPreview(ratingInput, ratingPreview);
      setFeedback(feedbackBox, "success", "Your review was submitted successfully.");
      setHint(hintBox, "Thanks for sharing your dorm experience.");
    } catch (error) {
      setFeedback(
        feedbackBox,
        "error",
        error instanceof Error ? error.message : "Something went wrong while submitting your review."
      );
      setHint(hintBox, "Your review was not saved. Please try again.");
    } finally {
      toggleSubmitting(submitButton, false);
    }
  });
});

function getSupabaseClient() {
  const config = window.DormScopeConfig;
  if (!window.supabase || !config?.supabaseUrl || !config?.supabasePublishableKey) {
    return null;
  }

  return window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey);
}

function getListingContext() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id") || "",
    slug: params.get("slug") || "",
    name: ""
  };
}

function renderListingContext(element, listing) {
  if (!element) {
    return;
  }

  if (listing.name) {
    element.textContent = `Reviewing: ${listing.name}`;
    return;
  }

  if (listing.slug) {
    element.textContent = `Preparing review for dorm: ${listing.slug}`;
    return;
  }

  if (listing.id) {
    element.textContent = "Preparing review for the selected dorm.";
    return;
  }

  element.textContent = "No dorm was selected yet. Open this page from a listing to attach your review to the right dorm.";
}

async function hydrateListingName(supabase, listingContext, contextText, feedbackBox) {
  try {
    const listing = await findListing(supabase, listingContext);
    if (!listing) {
      throw new Error("This dorm could not be found.");
    }

    listingContext.id = listing.id;
    listingContext.slug = listing.slug || listingContext.slug;
    listingContext.name = listing.name;
    renderListingContext(contextText, listingContext);
  } catch (error) {
    setFeedback(
      feedbackBox,
      "warning",
      error instanceof Error ? error.message : "Could not load the dorm information."
    );
    renderListingContext(contextText, {});
  }
}

async function findListing(supabase, listingContext) {
  let query = supabase.from("listings").select("id, slug, name").limit(1);

  if (listingContext.id) {
    query = query.eq("id", listingContext.id);
  } else if (listingContext.slug) {
    query = query.eq("slug", listingContext.slug);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error("Could not load the selected dorm. Please reopen the review page from the listing.");
  }

  return data;
}

function attachValidation(input, validator) {
  if (!input) {
    return;
  }

  const runValidation = () => {
    const message = validator(input.value);
    if (message) {
      showFieldError(input, message);
      return;
    }

    clearFieldError(input);
  };

  input.addEventListener("input", runValidation);
  input.addEventListener("blur", runValidation);
}

function validateReview(review) {
  return [
    validateAuthorName(review.authorName) && {
      field: "authorName",
      message: validateAuthorName(review.authorName)
    },
    validateRating(review.rating) && {
      field: "rating",
      message: validateRating(review.rating)
    },
    validateComment(review.comment) && {
      field: "comment",
      message: validateComment(review.comment)
    }
  ].filter(Boolean);
}

function validateAuthorName(value) {
  const trimmedValue = String(value).trim();
  if (trimmedValue.length < MIN_NAME_LENGTH || trimmedValue.length > MAX_NAME_LENGTH) {
    return `Your name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.`;
  }

  return "";
}

function validateRating(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 5) {
    return "Enter a whole-number star rating from 1 to 5.";
  }

  return "";
}

function validateComment(value) {
  const trimmedValue = String(value).trim();
  if (trimmedValue.length < MIN_COMMENT_LENGTH || trimmedValue.length > MAX_COMMENT_LENGTH) {
    return `Your comment must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters.`;
  }

  return "";
}

function showValidationErrors(errors, feedbackBox, fields) {
  const fieldMap = {
    authorName: fields.authorNameInput,
    rating: fields.ratingInput,
    comment: fields.commentInput
  };

  errors.forEach((error) => {
    const field = fieldMap[error.field];
    if (field) {
      showFieldError(field, error.message);
    }
  });

  setFeedback(feedbackBox, "error", errors[0].message);
}

function createFeedbackBox() {
  const element = document.createElement("p");
  element.className = "form-feedback";
  element.setAttribute("aria-live", "polite");
  return element;
}

function createHintBox() {
  const element = document.createElement("p");
  element.className = "rate-hint";
  return element;
}

function createCommentCounter() {
  const element = document.createElement("p");
  element.className = "comment-counter";
  return element;
}

function createRatingPreview() {
  const element = document.createElement("p");
  element.className = "rating-preview";
  return element;
}

function updateCommentCounter(commentInput, counter) {
  const length = commentInput?.value.trim().length || 0;
  const remaining = Math.max(MIN_COMMENT_LENGTH - length, 0);

  counter.textContent = remaining > 0
    ? `${remaining} more characters needed`
    : `${length}/${MAX_COMMENT_LENGTH} characters`;
}

function updateRatingPreview(ratingInput, preview) {
  const rating = Number(ratingInput?.value || DEFAULT_RATING);
  const safeRating = Number.isInteger(rating) ? Math.min(Math.max(rating, 1), 5) : DEFAULT_RATING;
  preview.textContent = `Current rating: ${safeRating}/5 ${"★".repeat(safeRating)}`;
}

function ensureReviewFeed() {
  let feed = document.querySelector(".review-feed");
  if (feed) {
    return feed.querySelector(".review-feed-list");
  }

  feed = document.createElement("section");
  feed.className = "review-feed";
  feed.innerHTML = `
    <h2>Recent Reviews</h2>
    <p class="review-feed-copy">Recent reviews for this dorm will appear here.</p>
    <div class="review-feed-list">
      <p class="review-feed-empty">No reviews loaded yet.</p>
    </div>
  `;

  document.querySelector(".rate-page")?.append(feed);
  return feed.querySelector(".review-feed-list");
}

async function hydrateRecentReviews(supabase, reviewFeed, listingContext) {
  if (!reviewFeed || !supabase || !listingContext) {
    return;
  }

  try {
    const listing = await findListing(supabase, listingContext);
    if (!listing?.id) {
      reviewFeed.innerHTML = '<p class="review-feed-empty">Pick a dorm first to load its reviews.</p>';
      return;
    }

    listingContext.id = listing.id;
    listingContext.slug = listing.slug || listingContext.slug;
    listingContext.name = listing.name;

    const { data, error } = await supabase
      .from("reviews")
      .select("author_name, rating, comment, created_at")
      .eq("listing_id", listing.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      throw new Error("Could not load recent reviews.");
    }

    reviewFeed.innerHTML = "";

    if (!data || data.length === 0) {
      reviewFeed.innerHTML = '<p class="review-feed-empty">No reviews yet. Be the first to rate this dorm.</p>';
      return;
    }

    data.forEach((review) => {
      prependReviewCard(reviewFeed, {
        ...review,
        listing_name: listing.name
      }, false);
    });
  } catch (error) {
    reviewFeed.innerHTML = `<p class="review-feed-empty">${
      error instanceof Error ? error.message : "Could not load recent reviews."
    }</p>`;
  }
}

function prependReviewCard(reviewFeed, review, prepend = true) {
  const empty = reviewFeed.querySelector(".review-feed-empty");
  empty?.remove();

  const card = document.createElement("article");
  card.className = "review-card";
  card.innerHTML = `
    <div class="review-card-heading">
      <h3>${escapeHtml(review.author_name)}</h3>
      <p class="review-card-rating">${review.rating}/5 ${"★".repeat(review.rating)}</p>
    </div>
    <p class="review-card-meta">${escapeHtml(formatReviewDate(review.created_at))}</p>
    <p class="review-card-comment">${escapeHtml(review.comment)}</p>
  `;

  if (prepend) {
    reviewFeed.prepend(card);
  } else {
    reviewFeed.append(card);
  }
}

function showFieldError(input, message) {
  input.setAttribute("aria-invalid", "true");
  input.classList.add("field-invalid");

  const errorId = `${input.id}-error`;
  let error = document.getElementById(errorId);
  if (!error) {
    error = document.createElement("p");
    error.id = errorId;
    error.className = "form-message-error";
    input.insertAdjacentElement("afterend", error);
  }

  error.textContent = message;
  input.setAttribute("aria-describedby", errorId);
}

function clearFieldError(input) {
  input.removeAttribute("aria-invalid");
  input.removeAttribute("aria-describedby");
  input.classList.remove("field-invalid");
  document.getElementById(`${input.id}-error`)?.remove();
}

function clearFieldErrors(form) {
  form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
    field.classList.remove("field-invalid");
  });
  form.querySelectorAll(".form-message-error").forEach((element) => {
    element.remove();
  });
}

function toggleSubmitting(button, isSubmitting) {
  if (!button) {
    return;
  }

  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? "Submitting..." : "Submit";
}

function setFeedback(element, type, message) {
  element.className = "form-feedback";
  if (type) {
    element.classList.add(`form-feedback-${type}`);
  }
  element.textContent = message;
}

function setHint(element, message) {
  element.textContent = message;
}

function friendlySupabaseError(message) {
  const safeMessage = String(message || "");
  if (safeMessage.toLowerCase().includes("violates row-level security")) {
    return "The database rejected this review. Check the review permissions in Supabase.";
  }

  if (safeMessage.toLowerCase().includes("foreign key")) {
    return "DormScope could not match this review to a dorm listing.";
  }

  return safeMessage || "The review could not be submitted.";
}

function formatReviewDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
