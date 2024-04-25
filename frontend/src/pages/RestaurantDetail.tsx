import CheckoutButton from "@/components/CheckoutButton";
import MenuItems from "@/components/MenuItems";
import OrderSummary from "@/components/OrderSummary";
import RestaurantInfo from "@/components/RestaurantInfo";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import {Button} from "@/components/ui/button";
import {Card, CardFooter} from "@/components/ui/card";
import {UserFormData} from "@/form/UserProfileForm";
import {useGetRestaurantDetails} from "@/graphql/queries/restaurant";
import {CartItem, MenuItem} from "@/types";
import {Loader2} from "lucide-react";
import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

export default function RestaurantDetail() {
  const navigate = useNavigate();
  const {restaurantId} = useParams();
  const {results: restaurant, isLoading} =
    useGetRestaurantDetails(restaurantId);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storedCartItem = sessionStorage.getItem(`cartItems:${restaurantId}`);
    return storedCartItem ? JSON.parse(storedCartItem) : [];
  });

  const addToCart = (menuItems: MenuItem) => {
    setCartItems((prevState) => {
      const hasExistingItem = cartItems.find(
        (item) => item._id === menuItems._id
      );

      let updateCartItems;
      if (hasExistingItem) {
        updateCartItems = prevState.map((cartItem) =>
          cartItem._id === menuItems._id
            ? {...cartItem, quantity: cartItem.quantity + 1}
            : cartItem
        );
      } else {
        updateCartItems = [
          ...prevState,
          {
            _id: menuItems._id,
            name: menuItems.name,
            price: menuItems.price,
            quantity: 1,
          },
        ];
      }
      sessionStorage.setItem(
        `cartItems:${restaurantId}`,
        JSON.stringify(updateCartItems)
      );
      return updateCartItems;
    });
  };

  const removeFromCart = (cartItem: CartItem) => {
    setCartItems((prevState) => {
      const updatedCartItems = prevState.filter(
        (item) => cartItem._id !== item._id
      );
      sessionStorage.setItem(
        `cartItems:${restaurantId}`,
        JSON.stringify(updatedCartItems)
      );
      return updatedCartItems;
    });
  };

  const onCheckout = (userFormData: UserFormData) => {
    console.log("User data", userFormData);
  };

  if (isLoading || !restaurant) {
    return <Loader2 size={40} className="animate-spin text-orange-500" />;
  }
  return (
    <>
      <Button
        variant="link"
        className="text-blue-500 hover:underline"
        onClick={() => navigate(-1)}
      >
        &lt;- Back to List
      </Button>
      <div className="flex flex-col gap-10">
        <AspectRatio ratio={16 / 7}>
          <img
            src={restaurant.imageUrl}
            className="rounded-md object-cover h-full w-full"
          />
        </AspectRatio>
        <div className="grid md:grid-cols-[4fr_2fr] gap-5 md:px-32">
          <div className="flex flex-col gap-4">
            <RestaurantInfo restaurant={restaurant} />
            <span className="text-2xl font-bold tracking-tight">Menu</span>
            {restaurant.menuItems.map((menuItem) => (
              <MenuItems
                key={menuItem._id}
                menuItem={menuItem}
                addToCart={addToCart}
              />
            ))}
          </div>
          <div>
            <Card className="shadow-md">
              <OrderSummary
                restaurant={restaurant}
                cartItems={cartItems}
                removeFromCart={removeFromCart}
              />
              <CardFooter>
                <CheckoutButton
                  disabled={cartItems.length === 0}
                  onCheckout={onCheckout}
                />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}