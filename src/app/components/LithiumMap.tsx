"use client";

import { useCallback, useState } from "react";
import { nanoid } from "nanoid";
import Map, {
  NavigationControl,
  Source,
  Layer,
  FillLayer,
  Popup,
  ScaleControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import lithium from "@/app/data/mapadominerio.Li.geo.json";
import styles from "@/app/css/LithiumMap.module.scss";
const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

interface Details {
  uuid: number;
  code: string;
  name: string;
  proponent: string;
  minerals: string[];
  decree: string;
  mineralGroups: string[];
  type: string;
  data: string;
}

const layerStyleOne: FillLayer = {
  id: "lithium",
  type: "fill",
  source: "lithium",
  paint: {
    // "fill-color": "#4E3FC8",
    "fill-color": [
      "match",
      ["get", "layer"],
      "PPMD-contract",
      "#00008B",
      "PPMD-req",
      "blue",
      "EXMD-req",
      "red",
      "EXMD-contract",
      "#8B0000",
      "PT",
      "purple",
      "gray",
    ],
    "fill-opacity": 0.7,
  },
};

export default function LithiumMap() {
  const [cursor, setCursor] = useState("auto");
  const [details, setDetails] = useState<Details[] | null>(null);
  const [coordinates, setCoordinates] = useState<number[]>([]);

  console.log("Coordinates: ", coordinates);
  console.log("Details: ", details);

  const onMouseEnter = () => setCursor("pointer");
  const onMouseLeave = () => setCursor("auto");

  const handleClick = (event: any) => {
    if (event.features.length) {
      setCoordinates([event.lngLat.lng, event.lngLat.lat]);

      const setType = (layer: string) => {
        let type: string;

        switch (layer) {
          case "PPMD-req":
            type = lithium.metadata.layers["PPMD-req"].lang.pt;
            break;
          case "PPMD-contract":
            type = lithium.metadata.layers["PPMD-contract"].lang.pt;
            break;
          case "EXMD-req":
            type = lithium.metadata.layers["EXMD-req"].lang.pt;
            break;
          case "EXMD-contract":
            type = lithium.metadata.layers["EXMD-contract"].lang.pt;
            break;
          default:
            type = lithium.metadata.layers["PT"].lang.pt;
        }
        return type;
      };

      const info = event.features.map((feature: any) => {
        console.log("Feature: ", feature.properties);
        const {
          name,
          id,
          proponent,
          act,
          data,
          minerals,
          mineralGroups,
          layer,
        } = feature.properties;

        return {
          uuid: nanoid(),
          code: id,
          name,
          proponent,
          decree: act,
          data,
          minerals,
          mineralGroups,
          type: setType(layer),
        };
      });

      setDetails(info);
    }
  };
  return (
    <div className={styles.wrapper}>
      <ul className={styles.legend}>
        <li className={styles.PPMDreq}>
          {lithium.metadata.layers["PPMD-req"].lang.pt}
        </li>
        <li className={styles.PPMDcontract}>
          {lithium.metadata.layers["PPMD-contract"].lang.pt}
        </li>
        <li className={styles.EXMDreq}>
          {lithium.metadata.layers["EXMD-req"].lang.pt}
        </li>
        <li className={styles.EXMDcontract}>
          {lithium.metadata.layers["EXMD-contract"].lang.pt}
        </li>
        <li className={styles.PT}>{lithium.metadata.layers["PT"].lang.pt}</li>
      </ul>

      <Map
        reuseMaps
        initialViewState={{
          longitude: -8.042,
          latitude: 40.175,
          bounds: [
            [-12, 36],
            [-4, 43],
          ],
        }}
        style={{ maxWidth: 400, height: 600 }}
        mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`}
        maxBounds={[
          [-12, 36],
          [-4, 43],
        ]}
        interactiveLayerIds={["lithium"]}
        cursor={cursor}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <NavigationControl />
        <Source id="lithium" type="geojson" data={lithium}>
          <Layer {...layerStyleOne} />
        </Source>
        {details &&
          details.map((info, index) => (
            <Popup
              key={info.uuid}
              longitude={coordinates[0]}
              latitude={coordinates[1]}
              anchor={index % 2 ? "bottom" : "top"}
              className={styles.popup}
            >
              <div className={styles.popupContent}>
                <h1>{info.name}</h1>
                <ul>
                  <li>
                    <span>Promotor: </span>
                    {info.proponent}
                  </li>
                  <li>
                    <span>Minerais: </span>
                    {info.minerals}
                  </li>
                  <li>
                    <span>Data do contrato: </span>
                    {info.data}
                  </li>
                  <li>
                    <span>Legislação: </span>
                    {info.decree}
                  </li>
                  <li>
                    <span>Situação atual: </span>
                    {info.type}
                  </li>
                </ul>
              </div>
            </Popup>
          ))}
        <ScaleControl />
      </Map>
    </div>
  );
}
