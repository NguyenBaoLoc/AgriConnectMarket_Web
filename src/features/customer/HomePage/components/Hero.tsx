import { Button } from '../../../../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onNavigateToProducts: () => void;
}

export function Hero({ onNavigateToProducts }: HeroProps) {
  const navigate = useNavigate();
  return (
    <section className="relative bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-green-600 text-white rounded-full">
              🌱 Fresh & Organic
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-green-900">
              Farm Fresh Produce Delivered to Your Door
            </h1>
            <p className="text-lg text-green-700">
              Experience the finest selection of organic fruits, vegetables, and
              leafy greens. Harvested fresh daily and delivered with care.
            </p>
            <div className="flex gap-4">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onNavigateToProducts}
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate('/farms')}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Learn More
              </Button>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-green-900">500+</div>
                <div className="text-sm text-green-600">Products</div>
              </div>
              <div>
                <div className="text-green-900">100%</div>
                <div className="text-sm text-green-600">Organic</div>
              </div>
              <div>
                <div className="text-green-900">24/7</div>
                <div className="text-sm text-green-600">Support</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1715941873083-4ea6926678dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0cyUyMGFzc29ydG1lbnR8ZW58MXx8fHwxNzU5OTg2NjgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fresh fruits assortment"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-400 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-600 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
