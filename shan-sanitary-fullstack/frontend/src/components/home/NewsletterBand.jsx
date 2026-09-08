import { useState } from "react";

// UI-only, per the original spec ("no real submission logic needed") —
// labeled honestly here rather than pretending to call a real endpoint
// that doesn't exist in this project's scope.
const NewsletterBand = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className="bg-carbon text-white py-12">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h2 className="text-xl font-bold mb-2">Stay Updated</h2>
        <p className="text-white/60 text-sm mb-6">Get notified about new arrivals and offers</p>
        {subscribed ? (
          <p className="text-wine-light font-medium">Thanks for subscribing!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2.5 rounded-lg text-carbon focus:outline-none"
            />
            <button className="bg-wine px-5 py-2.5 rounded-lg font-medium hover:bg-wine-dark transition-colors">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterBand;