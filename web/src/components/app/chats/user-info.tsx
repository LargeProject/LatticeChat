import {
  CardContainer,
  CardBody,
  CardItem,
} from '../../../components/ui/3d-card'
import anonImage from '../../images/anonymous.png'

export function UserInfoPanel({
  user,
}: {
  user: { name: string; avatar: string }
}) {
  return (
    <aside className="sticky top-0 self-start h-screen border-l border-(--line) bg-(--surface) p-2">
      {' '}
      <CardContainer className="inter-var">
        <CardBody className="bg-gray-50 relative group/card dark:bg-black border w-full h-full max-w-sm rounded-xl p-4">
          <CardItem
            translateZ="10"
            className="text-xl font-bold text-neutral-600 dark:text-white"
          >
            {user.name}
          </CardItem>
          <CardItem
            translateZ="20"
            rotateX={0}
            rotateZ={0}
            className="w-full mt-4"
          >
            <img
              src={anonImage}
              height="100"
              width="100"
              className="h-auto w-auto object-cover rounded-xl group-hover/card:shadow-xl"
              alt="thumbnail"
            />
          </CardItem>

          <CardItem
            as="p"
            translateZ="10"
            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
          >
            Account created on
          </CardItem>
        </CardBody>
      </CardContainer>
    </aside>
  )
}
