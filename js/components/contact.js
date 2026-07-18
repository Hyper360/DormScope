document.addEventListener("DOMContentLoaded", () => {
	const contactForm = document.querySelector("form");
	const nameInput = document.querySelector("#name");
	const emailInput = document.querySelector("#email");
	const subjectInput = document.querySelector("#subject");
	const messageInput = document.querySelector("#message");
	const feedbackMessage = document.querySelector("#form-feedback");

	contactForm.addEventListener("submit", (event) => {
		event.preventDefault();

		const errors = [];

		resetFeedback();

		if (nameInput.value.trim().length < 2) {
			errors.push("Name must be at least 2 characters long.");
			showInvalid(nameInput);
		} else {
			showValid(nameInput);
		}

		if (!isValidEmail(emailInput.value.trim())) {
			errors.push("Please enter a valid email address.");
			showInvalid(emailInput);
		} else {
			showValid(emailInput);
		}

		if (subjectInput.value.trim().length < 3) {
			errors.push("Subject must be at least 3 characters long.");
			showInvalid(subjectInput);
		} else {
			showValid(subjectInput);
		}

		if (messageInput.value.trim().length < 20) {
			errors.push("Message must be at least 20 characters long.");
			showInvalid(messageInput);
		} else {
			showValid(messageInput);
		}

		if (errors.length > 0) {
			feedbackMessage.textContent = errors.join(" ");
			feedbackMessage.className = "form-feedback error-message";
			return;
		}

		feedbackMessage.textContent = "Thank you! Your message has been validated successfully.";
		feedbackMessage.className = "form-feedback success-message";

		contactForm.reset();
		clearInputStyles();
	});

	function isValidEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	function showInvalid(input) {
		input.classList.add("invalid-input");
		input.classList.remove("valid-input");
	}

	function showValid(input) {
		input.classList.add("valid-input");
		input.classList.remove("invalid-input");
	}

	function resetFeedback() {
		feedbackMessage.textContent = "";
		feedbackMessage.className = "form-feedback";
	}

	function clearInputStyles() {
		const formFields = [nameInput, emailInput, subjectInput, messageInput];

		formFields.forEach((field) => {
			field.classList.remove("valid-input", "invalid-input");
		});
	}
});
