import { memo } from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

export interface RatingStarsProps {
    rating: number;
    max?: number;
}

const RatingStars = ({ rating, max = 5 }: RatingStarsProps) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: fullStars }, (_, i) => (
                <FaStar
                    key={`full-star-${i + 1}`}
                    className="w-3.5 h-3.5 text-yellow-500"
                />
            ))}
            {hasHalfStar && (
                <FaStarHalfAlt
                    key="half-star"
                    className="w-3.5 h-3.5 text-yellow-500"
                />
            )}
            {Array.from({ length: emptyStars }, (_, i) => (
                <FaRegStar
                    key={`empty-star-${fullStars + (hasHalfStar ? 1 : 0) + i + 1}`}
                    className="w-3.5 h-3.5 text-yellow-500"
                />
            ))}
        </div>
    );
};

export default memo(RatingStars);
