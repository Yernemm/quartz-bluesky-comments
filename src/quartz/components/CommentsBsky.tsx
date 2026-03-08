import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import script from "./scripts/commentsbsky.inline"

type Options = {
    author: string
}

export default ((opts: Options) => {
  const CommentsBsky: QuartzComponent = ({ displayClass, fileData, cfg }: QuartzComponentProps) => {

    if (!fileData.frontmatter?.blueskypost || typeof fileData.frontmatter?.blueskypost !== "string") {
      return <></>
    }

    const postUrl : string = fileData.frontmatter.blueskypost;



    return (
      <div>
        <h1><span id="bluesky-comment-count"></span></h1>
        <p><a href={postUrl} target="_blank" rel="noopener noreferrer">
          <i>Join the conversation on Bluesky!</i>
        </a></p>
        <div id="bluesky-comments" class="bluesky-comments" data-post-url={postUrl} data-author={opts.author}>
        </div>
        <hr />
      </div>
    )
  }

  CommentsBsky.afterDOMLoaded = script

  return CommentsBsky
}) satisfies QuartzComponentConstructor<Options>
