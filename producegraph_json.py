import networkx as nx
import random
import string
import array
import operator
from networkx.readwrite import d3_js

# CONSTANTS: ##################################
pct_edges_to_retain = 0.02
###############################################


# Importing graph information
print "Importing retweet network graph"
retweet_network = nx.read_graphml('./ICWSM_DATA/retweet.graphml')

# Sanity Check
print "############### INITIAL IMPORT ################"
print "Number of edges: " + str(retweet_network.number_of_edges())
print "Number of nodes: " + str(retweet_network.number_of_nodes())

# Tags to include
target_tags = [
"#teaparty",  # (more right)
"#tlot",    # Top liberterians on Twitter (more right)
"#sgp",     # Smart Girl Politics (more right)
"#votedem", # Vote democrat
"#obama",   
"#lgbt",     # LGBT
"#dadt",    # Don't ask dont tell
]

# Put tags into nodes
for node in retweet_network.nodes(data=True):
    node[1]['tags'] = []   # Initializes empty tag list

# Generates Left-Right table
left_right_table = {}
for tag in target_tags:
    left_right_table[tag] = {'left': 0, 'right': 0}
    
# Goes over edges, removing edges that do not use our taglist
for edge in retweet_network.edges(data=True):
    source_node = edge[0]
    dest_node = edge[1]
    edge_data_dict = edge[2]         # Is in the form {'tags': u"['#teabagger'...]", 'time': 'sth'}
    tag_string = edge_data_dict['tags']    # Returns a string of form u"['#teabagger'...]"
    tag_array = eval(tag_string)
    edge_is_invalid = True
    for tag in tag_array:
        if tag in target_tags:
            # Inserts tags into nodes
            edge_is_invalid = False
            if tag not in retweet_network.node[source_node]['tags']:
                retweet_network.node[source_node]['tags'].append(tag)
            if tag not in retweet_network.node[dest_node]['tags']:
                retweet_network.node[dest_node]['tags'].append(tag)
    if edge_is_invalid:
        retweet_network.remove_edge(edge[0], edge[1])

# Removes nodes who aren't using our taglist
for node in retweet_network.nodes(data=True):
    if node[1]['tags'] == []:
        retweet_network.remove_node(node[0])  
        
print "############### GRAPH OF REDUCED TAGLIST ################"
print "Number of edges: " + str(retweet_network.number_of_edges())
print "Number of nodes: " + str(retweet_network.number_of_nodes())

# Probabilistically removes edges from the graph
for edge in retweet_network.edges(data=True):
    to_delete = random.random()
    if to_delete >= pct_edges_to_retain:
        retweet_network.remove_edge(edge[0], edge[1])

# Removes isolated nodes, calculates distribution
for node in retweet_network.nodes(data=True):
    if retweet_network.degree(node[0]) == 0:
        retweet_network.remove_node(node[0])
        continue
    # Builds Left-Right distribution
    node_taglist = node[1]['tags']
    for tag in node_taglist:
        if node[1]['cluster'] == "left":
            left_right_table[tag]['left'] += 1
        else:
            left_right_table[tag]['right'] += 1

print "############### PROBABILISTICALLY REDUCED GRAPH ################"
print "Number of edges: " + str(retweet_network.number_of_edges())
print "Number of nodes: " + str(retweet_network.number_of_nodes())

for tag in left_right_table:
    print tag + " " + str(left_right_table[tag])
    
# Testing:
print "Structure of a node: +++++++++++++++"
print retweet_network.nodes(data=True)[0]

print "Structure of an edge: ++++++++++++++"
print retweet_network.edges(data=True)[0]
    
# Exports to D3.js
d3_js.export_d3_js(retweet_network, files_dir="visualization", graphname="retweet_network", group="cluster", node_labels=False)


