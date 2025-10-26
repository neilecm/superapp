// inside your product card component
<button
  className="w-full rounded-2xl bg-black text-white py-2"
  onClick={() => {
    const item = {
      productId: product.id,
      name: product.name,
      price: product.price,  // integer in IDR
      qty: 1,
      imageUrl: product.imageUrl,
    };
    window.dispatchEvent(new CustomEvent("checkout:start", { detail: { item } }));
  }}
>
  Buy Now
</button>
