import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Pagination } from '../../../components/Pagination';
import { getFarms, type FarmItem } from './api';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Footer } from '../components';

export function FarmsPage() {
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMallOnly, setIsMallOnly] = useState(false);
  const [areaFilter, setAreaFilter] = useState('');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'newest'>(
    'newest'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMallOnly]);

  const navigate = useNavigate();

  const handleOpenFarm = (id: string) => {
    navigate(`/farm/${id}`);
  };

  const fetchFarms = async (term?: string) => {
    try {
      setLoading(true);
      const resp = await getFarms(term, isMallOnly);
      if (resp.success) {
        setFarms(resp.data || []);
      } else {
        toast.error(resp.message || 'Failed to fetch farms');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const onSearch = async () => {
    await fetchFarms(searchTerm || undefined);
  };

  // Front-end filtering and sorting
  const filteredFarms = useMemo(() => {
    let list = [...farms];
    if (areaFilter) {
      list = list.filter((f) =>
        (f.area || '').toLowerCase().includes(areaFilter.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'nameAsc':
        list.sort((a, b) => a.farmName.localeCompare(b.farmName));
        break;
      case 'nameDesc':
        list.sort((a, b) => b.farmName.localeCompare(a.farmName));
        break;
      case 'newest':
      default:
        list.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        break;
    }

    return list;
  }, [farms, areaFilter, sortBy]);

  // Pagination logic
  const totalFarms = filteredFarms.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleFarms = filteredFarms.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div>
      <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6 gap-4'>
        <h1 className='text-2xl font-semibold'>Farms</h1>
        <div className='flex items-center gap-2 w-full max-w-xl'>
          <Input
            placeholder='Search farms...'
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className='flex-1'
          />
          <Button onClick={onSearch} disabled={loading}>
            Search
          </Button>
        </div>
      </div>

      <Card className='p-4 mb-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={isMallOnly}
                onChange={(e) => setIsMallOnly(e.target.checked)}
              />
              <span>Show mall farms only</span>
            </label>
          </div>

          <div className='flex items-center gap-2'>
            <label className='text-sm'>Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className='border px-2 py-1 rounded'
            >
              <option value='newest'>Newest</option>
              <option value='nameAsc'>Name A → Z</option>
              <option value='nameDesc'>Name Z → A</option>
            </select>
          </div>
        </div>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
         {loading && <p>Loading farms...</p>}
         {!loading && visibleFarms.length === 0 && (
           <p className='text-gray-500'>No farms found</p>
         )}
         {!loading &&
           visibleFarms.map((farm) => (
             <Card
               key={farm.id}
               className='p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow'
               onClick={() => handleOpenFarm(farm.id)}
             >
               <div className='relative w-full h-44 hover:scale-105 transition-transform'>
                 {farm.bannerUrl ? (
                   <img
                     src={farm.bannerUrl}
                     alt={farm.farmName}
                     className='w-full object-cover hover:scale-105 transition-transform'
                     style={{
                       maxHeight: '30vh',
                     }}
                   />
                 ) : (
                   <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                     No image
                   </div>
                 )}

                 {farm.isConfirmAsMall && (
                   <div className='absolute top-3 left-3'>
                     <Badge variant='destructive'>Mall</Badge>
                   </div>
                 )}
               </div>

               <div className='p-4'>
                 <h3 className='font-semibold mb-1 text-lg'>{farm.farmName}</h3>
                 <p className='text-sm text-gray-600 mb-3'>{farm.farmDesc}</p>
                 <div className='flex items-center justify-between text-sm text-gray-600'>
                   <div>Area: {farm.area || 'N/A'}</div>
                   <div>{farm.phone || ''}</div>
                 </div>
               </div>
             </Card>
           ))}
       </div>

       {/* Pagination */}
       <div className='mt-8'>
         <Pagination
           currentPage={currentPage}
           totalItems={totalFarms}
           itemsPerPage={itemsPerPage}
           onPageChange={handlePageChange}
           onItemsPerPageChange={handleItemsPerPageChange}
         />
       </div>
       </div>
       <Footer />
       </div>
       );
}

export default FarmsPage;
