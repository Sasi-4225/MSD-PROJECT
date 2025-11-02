import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  LoadScript,
  GoogleMap,
  StandaloneSearchBox,
  Marker,
} from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';

const defaultLocation = { lat: 45.516, lng: -73.56 };
const libs = ['places'];

export default function MapScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [googleApiKey, setGoogleApiKey] = useState('');
  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(defaultLocation);
  const [loading, setLoading] = useState(true);

  // Refs
  const mapRef = useRef(null);
  const placeRef = useRef(null);

  // ✅ Get user current GPS location
  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCenter(userPos);
        setLocation(userPos);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        toast.error('Unable to get location: ' + err.message);
      }
    );
  };

  // ✅ Fetch Google Maps API Key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data } = await axios.get(
          'https://backend-3s5c.onrender.com/api/keys/google',
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        setGoogleApiKey(data.key);
        getUserCurrentLocation();
      } catch (err) {
        setLoading(false);
        toast.error('Google API key error: ' + getError(err));
      }
    };

    fetchApiKey();
    ctxDispatch({ type: 'SET_FULLBOX_ON' });
  }, [ctxDispatch, userInfo]);

  // ✅ Map load handler
  const onLoad = (map) => {
    mapRef.current = map;
  };

  // ✅ Update marker as map moves
  const onIdle = () => {
    if (!mapRef.current) return;
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    });
  };

  // ✅ Search box load
  const onLoadPlaces = (place) => {
    placeRef.current = place;
  };

  // ✅ When user selects a place from search
  const onPlacesChanged = () => {
    if (!placeRef.current) return;

    const places = placeRef.current.getPlaces();
    if (!places || places.length === 0) {
      toast.error('Invalid location');
      return;
    }

    const loc = places[0].geometry.location;
    const selected = { lat: loc.lat(), lng: loc.lng() };

    setCenter(selected);
    setLocation(selected);
  };

  // ✅ Confirm location button
  const onConfirm = () => {
    const places = placeRef.current?.getPlaces() || [{}];

    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
      payload: {
        lat: location.lat,
        lng: location.lng,
        address: places[0].formatted_address || '',
        name: places[0].name || '',
        vicinity: places[0].vicinity || '',
        googleAddressId: places[0].id || '',
      },
    });

    toast.success('Location Selected ✅');
    navigate('/shipping');
  };

  return (
    <div className="full-box">
      {loading && <p>Loading map…</p>}

      {!loading && googleApiKey && (
        <LoadScript googleMapsApiKey={googleApiKey} libraries={libs}>
          <GoogleMap
            id="map"
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={center}
            zoom={15}
            onLoad={onLoad}
            onIdle={onIdle}
          >
            <StandaloneSearchBox
              onLoad={onLoadPlaces}
              onPlacesChanged={onPlacesChanged}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  width: '300px',
                  padding: '5px',
                  backgroundColor: '#fff',
                  zIndex: 10,
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <input
                  type="text"
                  placeholder="Search your address"
                  style={{ width: '100%', padding: '8px' }}
                />
                <Button onClick={onConfirm}>Confirm</Button>
              </div>
            </StandaloneSearchBox>

            <Marker position={location}></Marker>
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
}
