import { useEffect, useState } from "react";

type AvailabilityMap = Record<string, string[]>;

export function useAvailability(): AvailabilityMap {
  const [availability, setAvailability] = useState<AvailabilityMap>({});

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/availability.json`)
      .then(async (response) => {
        if (!response.ok) {
          return {};
        }
        return (await response.json()) as AvailabilityMap;
      })
      .then(setAvailability)
      .catch(() => {
        setAvailability({});
      });
  }, []);

  return availability;
}