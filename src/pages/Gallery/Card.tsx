import type { IGalleryItem } from '../../../dto/notion';

function Card({
  element,
  onClick,
  onMouseEnter,
  onPointerDown,
}: {
  element: IGalleryItem;
  onClick: () => void;
  onMouseEnter: () => void;
  onPointerDown: () => void;
}) {
  return (
    <label
      key={element.id}
      className="hover-3d cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onPointerDown={onPointerDown}
      htmlFor="picture-modal"
    >
      <figure className="w-full aspect-square">
        {element.cover && (
          <div className="relative">
            <h1 className="absolute left-4 bottom-4 font-noto-serif text-2xl">
              {element.properties.제목.title[0].plain_text}
            </h1>
            <img
              src={
                element.cover.type === 'external'
                  ? element.cover.external?.url
                  : element.cover.file?.url
              }
              alt={element.properties.제목.title[0].plain_text}
              className="w-full aspect-square absolute object-cover rounded-xl mask-b-from-0% bg-white"
            />
            <div className="w-full aspect-square bg-base-100 rounded-xl" />
          </div>
        )}
        <img src={element.cover?.external?.url} />
      </figure>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </label>
  );
}

export default Card;
