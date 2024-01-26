import { useState, useRef } from "react";
import { Map, MarkerClusterer } from "react-kakao-maps-sdk";
import AirplaneIcon from "@assets/icons/airplane.svg?react";
import * as S from "./styles";
import { ProductsMarkers } from "./ProductsMarkers";
import ProductCardForMap from "../ProductCard/ProductCardForMap";
import useProducts from "@pages/products/api/queries";
import { MyPositionMarker } from "./MyPositionMarker";
import Research from "./Research";

export interface UserPositionType {
  lat: number | null;
  lng: number | null;
  errorMessage: string;
  isLoading: boolean;
}

export interface MapCenter {
  lat: number;
  lng: number;
}

const KakaoMap = () => {
  const { data: products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    products.length > 0 ? products[0].id : 0
  );
  const [mapCenter, setMapCenter] = useState<MapCenter>({
    lat: products.length > 0 ? products[0].latitude : 33.450701,
    lng: products.length > 0 ? products[0].longitude : 126.570667
  });
  const [userPosition, setUserPosition] = useState<UserPositionType>({
    lat: null,
    lng: null,
    errorMessage: "",
    isLoading: true
  });

  const mapRef = useRef<kakao.maps.Map>(null);

  const handleMyPositionClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(newPosition);
          setUserPosition((prev) => ({
            ...prev,
            lat: newPosition.lat,
            lng: newPosition.lng,
            isLoading: false
          }));
          mapRef.current?.setLevel(5);
          mapRef.current?.setCenter(
            new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude)
          );
        },
        (err) => {
          setUserPosition((prev) => ({
            ...prev,
            errorMessage: err.message,
            isLoading: false
          }));
        }
      );
    } else {
      setUserPosition((prev) => ({
        ...prev,
        errorMessage: "현재 위치를 사용할 수 없습니다.",
        isLoading: false
      }));
    }
  };

  const selectedProduct = products.find((product) => product.id === selectedProductId);

  return (
    <>
      <Map
        center={mapCenter}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          zIndex: 1000
        }}
        level={5}
        ref={mapRef}
      >
        {userPosition.lat && userPosition.lng ? <MyPositionMarker position={userPosition} /> : null}
        <MarkerClusterer averageCenter={true} minLevel={10} styles={[S.clustererStyles]}>
          <ProductsMarkers products={products} setSelectedProductId={setSelectedProductId} />
        </MarkerClusterer>
        <Research setSelectedProductId={setSelectedProductId} />
      </Map>
      <ProductCardForMap selectedProduct={selectedProduct!} />
      <S.Button onClick={handleMyPositionClick}>
        <AirplaneIcon />
      </S.Button>
    </>
  );
};

export default KakaoMap;
