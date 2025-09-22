import React, { useState } from "react";
import Header from "./Header";
import "../styles/Faqs.css"; // We will create this CSS file next

const faqData = [
  {
    question: "How do I sign up for a library account?",
    answer: "You can sign up online by clicking the 'Signup' button on the homepage. You will need to provide your student ID, name, email, and create a password. Once registered, you are ready to borrow books and use our services.",
  },
  {
    question: "What are the library's opening hours?",
    answer: "Our library is open from 9:00 AM to 6:00 PM on weekdays (Monday to Friday) and from 10:00 AM to 4:00 PM on Saturdays. We are closed on Sundays and public holidays.",
  },
  {
    question: "How many books can I borrow at one time?",
    answer: "Students can borrow up to 5 books at a time. The standard loan period for each book is 14 days. Please ensure you return them on time to avoid fines.",
  },
  {
    question: "Can I renew my borrowed books online?",
    answer: "Yes, you can renew your books through your online library account, provided they have not been reserved by another user. Simply log in, go to your borrowed items list, and select the 'Renew' option.",
  },
  {
    question: "What happens if I lose a library book?",
    answer: "If you lose a book, you will be required to pay for the cost of a replacement copy, plus a small administrative fee. Please report any lost items to the library staff as soon as possible.",
  },
];

function Faqs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    // If the clicked FAQ is already open, close it. Otherwise, open the new one.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Header />
      <div className="faq-page-container">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our library services, account management, and borrowing policies.</p>
        </div>

        <div className="faq-list">
          {faqData.map((item, index) => (
            <div className="faq-item" key={index}>
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <span>{item.question}</span>
                <span className="faq-toggle">{openIndex === index ? "−" : "+"}</span>
              </div>
              <div className={`faq-answer ${openIndex === index ? "open" : ""}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Faqs;