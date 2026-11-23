import { getStoreSettings } from "@/db/settings.server";

export default async function FooterContact() {
  const { store } = await getStoreSettings();

  return (
    <div>
      <b className="block mb-4">Contact</b>
      <p className="text-mute">Sat–Thu, 10am–8pm</p>
      {store.supportEmail && (
        <p className="text-mute mt-2">
          <a href={`mailto:${store.supportEmail}`} className="hover:text-ink">
            {store.supportEmail}
          </a>
        </p>
      )}
      {store.supportPhone && (
        <p className="text-mute mt-1">
          <a href={`tel:${store.supportPhone}`} className="hover:text-ink">
            {store.supportPhone}
          </a>
        </p>
      )}
      {store.address && <p className="text-mute mt-2">{store.address}</p>}
    </div>
  );
}
