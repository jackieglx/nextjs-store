import { fetchFeaturedProducts } from '@/utils/actions';
import EmptyList from '../global/EmptyList';
import SectionTitle from '../global/SectionTitle';
import ProductsGrid from '../products/ProductsGrid';

async function FeaturedProducts() {
    const featuredProducts = await fetchFeaturedProducts();
    if (featuredProducts.length === 0) return <EmptyList/>;

    return (
        <section className='pt-24'>
            <SectionTitle text='featured products'/>
            <ProductsGrid products={featuredProducts}/>
        </section>
    )
}

export default FeaturedProducts
