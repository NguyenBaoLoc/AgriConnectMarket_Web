import { Truck, Shield, Leaf, Clock } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Truck,
      title: "Free Delivery",
      description: "On orders over $50",
    },
    {
      icon: Shield,
      title: "100% Organic",
      description: "Certified fresh produce",
    },
    {
      icon: Leaf,
      title: "Eco Friendly",
      description: "Sustainable packaging",
    },
    {
      icon: Clock,
      title: "Same Day Delivery",
      description: "Order before 2pm",
    },
  ];

  return (
    <section className="py-12 bg-green-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-green-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-green-700">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
