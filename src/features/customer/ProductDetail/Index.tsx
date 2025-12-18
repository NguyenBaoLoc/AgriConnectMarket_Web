import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ProductDetailInfo } from './components/ProductDetailInfo';
import Reviews from './components/Reviews';
import VerificationQRCode from './components/VerificationQRCode';
import { getProductDetails } from '../ProductDetail/api';
import { useCart } from '../../../hooks/useCart';
import { Footer } from '../components';
import type { ProductDetail, CareEvent } from './types';
import { ProductBasicInfo } from './components/ProductBasicInfo';

interface ProductDetailProps {
  productId: string;
  onNavigateToProducts: () => void;
  onNavigateToTraceability: (
    careEvents: CareEvent[],
    errorMessage?: string
  ) => void;
  onNavigateToError: () => void;
  onNavigateToFarmDetail?: (farmId: string) => void;
}

const defaultProduct: ProductDetail = {
  id: '',
  name: '',
  price: 0,
  unit: '',
  category: '',
  image: '',
  farm: '',
  farmId: '',
  farmLocation: '',
  inStock: false,
  stock: 0,
  rating: 0,
  reviews: 0,
  description: '',
  verificationQr: '',
  features: [],
  nutritionFacts: {
    servingSize: '',
    calories: '',
    protein: '',
    carbs: '',
    fiber: '',
    vitaminC: '',
  },
};
export function ProductDetail({
  productId,
  onNavigateToProducts,
  onNavigateToTraceability,
  onNavigateToError,
  onNavigateToFarmDetail,
}: ProductDetailProps) {
  const { productId: urlProductId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail>(defaultProduct);
  const [quantity, setQuantity] = useState(1);
  const { handleAddToCart: addToCart, isLoading } = useCart();

  // Use URL parameter if available, otherwise use prop
  const effectiveProductId = urlProductId || productId;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await getProductDetails(effectiveProductId);
        console.log(response.data);
        if (response.success) {
          if (response.data) {
            setProduct(response.data);
          }
        } else {
          console.error('Failed to load product details.');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };
    if (effectiveProductId) {
      fetchProductDetails();
    }
  }, [effectiveProductId]);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  console.log(product);

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <ProductBasicInfo
          product={product}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAddToCart={handleAddToCart}
          onNavigateToTraceability={onNavigateToTraceability}
          onNavigateToError={onNavigateToError}
          onNavigateToFarmDetail={onNavigateToFarmDetail}
          isLoading={isLoading}
        />
        <ProductDetailInfo product={product} />

        {/* Verification QR Code - easy to scan */}
        {product.farmId && product.id && (
          <VerificationQRCode
            farmId={product.farmId}
            productId={product.id}
            qrSrc={
              product?.verificationQr ||
              'http://res.cloudinary.com/dos0qfmda/image/upload/v1765360909/agriconnect/batch-qrcodes/591fc461-ac94-4a12-cea3-08de37d31561.png'
            }
          />
        )}

        {/* Reviews component (client-side mock storage) */}
        {product.farmId && product.id && (
          <Reviews farmId={product.farmId} productId={product.id} />
        )}
      </div>
      <Footer />
    </div>
  );
}
