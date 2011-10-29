import networkx as nx
import random
import string
import array
import operator

# Importing graph information
print "Importing retweet network graph"
retweet_network = nx.read_graphml('./ICWSM_DATA/retweet.graphml')

# Sanity Check
print "Sanity check!!!!"
print "Number of edges: " + str(retweet_network.number_of_edges())
print "Number of nodes: " + str(retweet_network.number_of_nodes())

# Frequency dict of tags
freq_table = {}

# Put tags into nodes
for node in retweet_network.nodes(data=True):
    node[1]['tags'] = []   # Initializes empty tag list
    
# Testing
for edge in retweet_network.edges(data=True):
    source_node = edge[0]
    dest_node = edge[1]
    edge_data_dict = edge[2]         # Is in the form {'tags': u"['#teabagger'...]", 'time': 'sth'}
    tag_string = edge_data_dict['tags']    # Returns a string of form u"['#teabagger'...]"
    tag_array = eval(tag_string)
    for tag in tag_array:
         # Builds frequency table
        if tag in freq_table:
            freq_table[tag] += 1
        else:
            freq_table[tag] = 1
        # Inserts tags into nodes
        if tag not in retweet_network.node[source_node]['tags']:
            retweet_network.node[source_node]['tags'].append(tag)
        if tag not in retweet_network.node[dest_node]['tags']:
            retweet_network.node[dest_node]['tags'].append(tag)

# Sorts the frequency table to return top items
sorted_freq_table = sorted(freq_table.iteritems(), key=operator.itemgetter(1), reverse=True)

#TEST: Prints nodes
#print retweet_network.nodes(data=True)

# Left-Right table
left_right_table = {}
for tag in freq_table:
    left_right_table[tag] = {'left': 0, 'right': 0}

# Iterates through nodes to find distribution
for node in retweet_network.nodes(data=True):
    node_taglist = node[1]['tags']
    for tag in node_taglist:
        if node[1]['cluster'] == "left":
            left_right_table[tag]['left'] += 1
        else:
            left_right_table[tag]['right'] += 1

#print left_right_table

# Prints out left-right distribution of top tags
for index in range(20):
    current_top_tag = sorted_freq_table[index][0]
    print current_top_tag + " " + str(left_right_table[current_top_tag])


    
# Pick top 10 tags
# Delete edges that don't have 


