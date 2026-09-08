import { ShieldCheck, Truck, Tag, Clock } from "lucide-react";

const POINTS = [
  { icon: ShieldCheck, title: "Quality Assured", text: "Every product is checked before it reaches you" },
  { icon: Tag, title: "Wholesale & Retail", text: "Fair pricing for every kind of buyer" },
  { icon: Clock, title: "Trusted Since 2010", text: "Over a decade serving Karachi and beyond" },
  { icon: Truck, title: "Fast Delivery", text: "Reliable shipping across the country" },
];

const WhyChooseUs = () => (
  <section className="max-w-7xl mx-auto px-4 py-14">
    <h2 className="text-2xl font-bold text-center mb-10">Why Choose Us</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {POINTS.map((p) => (
        <div key={p.title} className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-wine/10 flex items-center justify-center text-wine">
            <p.icon size={24} />
          </div>
          <h3 className="font-medium text-sm mb-1">{p.title}</h3>
          <p className="text-xs text-carbon/50">{p.text}</p>
        </div>
      ))}
    </div>
  </section>
);

export default WhyChooseUs;