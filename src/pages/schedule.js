import React from 'react'
import { graphql, Link } from 'gatsby'
import Helmet from 'react-helmet'
import MarkdownStyles from '../css/markdown-styles'
import { Container, SmallTitle, MarkdownContainer } from '../utils/components'
import Layout from '../utils/components/Layout'

const currentDate = new Date()

export default function Schedule({ data }) {
	const { children } = data.transcripts.nodes.reduce(
		(acc, node) => {
			const {
				childMarkdownRemark: {
					html,
					frontmatter: {
						date,
						dateGroup,
						dateString,
						description,
						location,
						people,
						recording,
						time,
						title,
					},
				},
				name,
				relativeDirectory,
			} = node

			const isUpcoming = currentDate < new Date(date)

			if (isUpcoming && !acc.upcoming) {
				acc.children.push(
					<>
						<hr />
						<h2 key="upcoming">Upcoming Q&A's & Meetups</h2>
					</>,
				)
				acc.upcoming = true
			}

			if (!isUpcoming && !acc.past) {
				acc.children.push(
					<>
						<hr />
						<h2 key="past">Past Q&A's & Meetups</h2>
					</>,
				)
				acc.past = true
			}

			if (acc.current !== dateGroup) {
				acc.children.push(
					<h2 key={dateGroup}>
						{acc.past ? <s>{dateGroup}</s> : dateGroup}
					</h2>,
				)
				acc.current = dateGroup
			}

			acc.children.push(
				<article key={name}>
					<h3>{title}</h3>
					<ul>
						{[
							people,
							description,
							dateString,
							isUpcoming && time,
							location,
							recording,
						]
							.filter(Boolean)
							.map(field => (
								<li
									key={field}
									dangerouslySetInnerHTML={{ __html: field }}
								/>
							))}
						{html && !isUpcoming ? (
							<li>
								<Link
									to={`/transcripts/${relativeDirectory}/${name}`}
								>
									Transcript
								</Link>
							</li>
						) : null}
					</ul>
				</article>,
			)

			return acc
		},
		{ children: [] },
	)

	return (
		<Layout>
			<Container>
				<MarkdownStyles />
				<Helmet title={'Q&A Schedule'} />
				<SmallTitle>Q&A Schedule</SmallTitle>
				<MarkdownContainer className="markdown">
					<p>
						We host one or two Q&A’s per month with Facebook
						Engineers and other interesting developers in the React
						community. These Q&A’s usually take place on Thursdays
						from 1pm - 2pm PT. If you want to hear from someone
						specific in the community, let us know by contacting us
						via{' '}
						<Link to="https://twitter.com/reactiflux">Twitter</Link>{' '}
						or ping an admin or moderator in the{' '}
						<Link to="https://discord.gg/BkSU7Ju">
							#reactiflux-admin
						</Link>{' '}
						channel on discord.
					</p>
					{children}
				</MarkdownContainer>
			</Container>
		</Layout>
	)
}

export const pageQuery = graphql`
	query ScheduleTranscripts {
		transcripts: allFile(
			filter: { sourceInstanceName: { eq: "transcripts" } }
			sort: {
				fields: childMarkdownRemark___frontmatter___date
				order: DESC
			}
		) {
			nodes {
				name
				relativeDirectory
				childMarkdownRemark {
					html
					frontmatter {
						date
						dateGroup: date(formatString: "MMMM YYYY")
						dateString: date(formatString: "dddd MMMM Do, YYYY")
						description
						location
						people
						recording
						time
						title
					}
				}
			}
		}
	}
`
